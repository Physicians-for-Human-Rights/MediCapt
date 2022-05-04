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
        try {
            const json = JSON.parse(event.body);
            var metadata = recordMetadata_1.recordMetadataSchema.parse(json.metadata);
            var manifest = recordMetadata_1.recordManifestWithMD5Schema.parse(json.manifest);
        }
        catch (e) {
            return (0, common_utils_1.bad)(e, 'Bad input record');
        }
        try {
            var item = await ddb
                .getItem({
                TableName: process.env.record_table,
                Key: {
                    PK: { S: 'RECORD#' + recordId },
                    SK: { S: 'VERSION#latest' },
                },
            })
                .promise();
        }
        catch (e) {
            return (0, common_utils_1.bad)(e, 'No record exists to update');
        }
        try {
            var existingRecord = recordMetadata_1.recordMetadataSchemaStrip.parse(common_utils_1.DynamoDB.unmarshall(item.Item));
        }
        catch (e) {
            return (0, common_utils_1.bad)(e, 'Bad record data');
        }
        if (existingRecord.sealed)
            return (0, common_utils_1.bad)(existingRecord, 'Record already sealed');
        if (existingRecord.version !== metadata.version)
            return (0, common_utils_1.bad)([existingRecord.version, metadata.version], 'Out of date record');
        if (metadata.manifestHash) {
            // Otherwise the manifest is new
            const contents = [];
            async function createFileLink(v) {
                const filename = (0, common_utils_1.hashFilename)(existingRecord.recordUUID, v.sha256, v.filetype);
                const exists = await (0, common_utils_1.s3ObjectExists)(process.env.record_bucket, filename, s3);
                // Don't send upload links for existing resources
                if (exists)
                    return;
                const link = s3.createPresignedPost({
                    Bucket: process.env.record_bucket,
                    Fields: {
                        key: filename,
                        'Content-MD5': v.md5,
                    },
                    Expires: 600,
                    Conditions: [
                        // Images/pdfs/etc. should not be larger than 5MB
                        ['content-length-range', 0, 5000000],
                        ['eq', '$x-amz-server-side-encryption', 'aws:kms'],
                    ],
                });
                link.fields['x-amz-server-side-encryption'] = 'aws:kms';
                // link.fields['x-amz-server-side-encryption-aws-kms-key-id'] =
                //   process.env.record_bucket_kms
                contents.push({
                    sha256: v.sha256,
                    filetype: v.filetype,
                    filename: v.filename,
                    link,
                });
            }
            // NB It doesn't matter if the manifest already exists. If it does, we
            // won't produce a link for it. But, if the client starts the upload, then
            // disconnects, and later wants to continue uploading, it needs the
            // ability to continue with a manifest that already exists.
            //
            // If we could guarantee this never happens, we would be able to just exit
            // early, since we're reverting to a prior version.
            const manifestExists = await (0, common_utils_1.s3ObjectExists)(process.env.record_bucket, (0, common_utils_1.hashFilename)(existingRecord.recordUUID, metadata.manifestHash, 'manifest'), s3);
            if (!manifestExists) {
                await createFileLink({
                    md5: metadata.manifestMD5,
                    sha256: metadata.manifestHash,
                    filename: 'manifest',
                    filetype: 'manifest',
                });
            }
            await Promise.all(lodash_1.default.map(manifest.contents, async (v) => await createFileLink(v)));
            const fullManifest = {
                'storage-version': '1.0.0',
                root: manifest.root,
                contents: contents,
            };
            return (0, common_utils_1.good)({
                metadata,
                manifest: fullManifest,
            });
        }
        return (0, common_utils_1.bad)([], 'Missing manifest hash');
    }
    catch (e) {
        return (0, common_utils_1.bad)(e, 'Generic error');
    }
};
exports.handler = handler;
