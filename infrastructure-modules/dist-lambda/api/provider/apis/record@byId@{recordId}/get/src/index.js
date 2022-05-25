"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lodash_1 = __importDefault(require("lodash"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
aws_sdk_1.default.config.update({
    region: process.env.AWS_REGION,
});
const s3 = new aws_sdk_1.default.S3({ signatureVersion: 'v4', apiVersion: '2006-03-01' });
const ddb = new aws_sdk_1.default.DynamoDB({ apiVersion: '2012-08-10' });
const common_utils_1 = require("common-utils");
const recordMetadata_1 = require("utils/types/recordMetadata");
const handler = async (event, context) => {
    try {
        if (event.pathParameters && event.pathParameters.recordId) {
            var recordId = event.pathParameters.recordId;
        }
        else {
            return (0, common_utils_1.bad)(event.pathParameters, 'Missing event parameters');
        }
        const item = await ddb
            .getItem({
            TableName: process.env.record_table,
            Key: {
                PK: { S: 'RECORD#' + recordId },
                SK: { S: 'VERSION#latest' },
            },
        })
            .promise();
        try {
            const record = recordMetadata_1.recordMetadataSchemaStrip.parse(common_utils_1.DynamoDB.unmarshall(item.Item));
            function createLink(v) {
                return {
                    sha256: v.sha256,
                    filetype: v.filetype,
                    filename: v.filename,
                    link: s3.getSignedUrl('getObject', {
                        Bucket: process.env.record_bucket,
                        Key: (0, common_utils_1.hashFilename)(record.recordUUID, v.sha256, v.filetype),
                        // 10 minutes is a long time, but it might be needed for slow
                        // connections.
                        Expires: 600,
                    }),
                };
            }
            if (record.manifestHash) {
                const manifestObject = await s3
                    .getObject({
                    Bucket: process.env.record_bucket,
                    Key: (0, common_utils_1.hashFilename)(record.recordUUID, record.manifestHash, 'manifest'),
                })
                    .promise();
                if (!manifestObject.Body)
                    return (0, common_utils_1.bad)(manifestObject, 'Empty manifest');
                const body = recordMetadata_1.recordManifestSchema.parse(JSON.parse(manifestObject.Body.toString('utf-8')));
                const fullManifest = {
                    'storage-version': '1.0.0',
                    root: body.root,
                    contents: lodash_1.default.map(body.contents, v => createLink(v)),
                };
                return (0, common_utils_1.good)({
                    metadata: record,
                    manifest: fullManifest,
                    manifestLink: createLink({
                        sha256: record.manifestHash,
                        filetype: 'manifest',
                        filename: 'manifest',
                    }),
                });
            }
            else {
                // The record is empty
                return (0, common_utils_1.good)({
                    metadata: record,
                    manifest: {
                        'storage-version': '1.0.0',
                        root: '',
                        contents: [],
                    },
                });
            }
        }
        catch (e) {
            return (0, common_utils_1.bad)([item, e], 'Got bad item');
        }
    }
    catch (e) {
        return (0, common_utils_1.bad)(e, 'Generic error');
    }
};
exports.handler = handler;
