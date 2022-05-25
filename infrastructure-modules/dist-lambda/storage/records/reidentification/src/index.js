"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const uuid_1 = require("uuid");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
aws_sdk_1.default.config.update({
    region: process.env.AWS_REGION,
});
var s3 = new aws_sdk_1.default.S3({ apiVersion: '2006-03-01' });
const handler = async (event, context, callback) => {
    for (const record of event.Records) {
        const reidUUID = (0, uuid_1.v4)();
        await s3
            .putObjectTagging({
            Bucket: record.s3.bucket.name,
            Key: record.s3.object.key,
            Tagging: {
                TagSet: [
                    {
                        Key: 'reid',
                        Value: reidUUID,
                    },
                ],
            },
        })
            .promise();
        await s3
            .putObject({
            Body: reidUUID,
            Bucket: process.env.reidentificationBucketId,
            Key: record.s3.object.key,
            ServerSideEncryption: 'aws:kms',
        })
            .promise();
    }
    callback(null, {});
};
exports.handler = handler;
