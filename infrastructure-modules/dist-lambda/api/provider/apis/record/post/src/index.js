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
const ddb = new aws_sdk_1.default.DynamoDB({ apiVersion: '2012-08-10' });
var lambda = new aws_sdk_1.default.Lambda({
    apiVersion: '2015-03-31',
    region: process.env.AWS_REGION,
});
const common_utils_1 = require("common-utils");
const recordMetadata_1 = require("utils/types/recordMetadata");
const handler = async (event, context) => {
    try {
        try {
            var recordCreation = recordMetadata_1.recordMetadataSchemaByUser.parse(JSON.parse(event.body));
        }
        catch (e) {
            return (0, common_utils_1.bad)(e, 'Bad input record');
        }
        const recordUUID = (0, uuid_1.v4)();
        const ids = await (0, common_utils_1.machineIdToHumanId)(recordUUID, 'MR', lambda, process.env.humanid_lambda);
        const patientUUID = (0, uuid_1.v4)();
        const patientId = await (0, common_utils_1.machineIdToHumanId)(recordUUID, 'MP', lambda, process.env.humanid_lambda);
        const record = {
            ...recordCreation,
            recordUUID: ids.machineID,
            recordID: ids.humanID,
            patientUUID: patientId.machineID,
            patientID: patientId.humanID,
            createdDate: new Date(),
            createdByUUID: event.requestContext.authorizer.claims.sub,
            lastChangedByUUID: event.requestContext.authorizer.claims.sub,
            lastChangedDate: new Date(),
            manifestHash: '',
            manifestMD5: '',
            version: '1',
            sealed: false,
        };
        const recordDynamoLatest = {
            ...record,
            PK: 'RECORD#' + record.recordUUID,
            SK: 'VERSION#latest',
            GPK1: 'RECORD#' + record.recordID,
            GSK1: 'VERSION#latest',
            GPK2: 'VERSION#latest',
            GSK2: 'DATE#' + record.lastChangedDate.toISOString(),
            GPK3: 'LO#' + record.locationID,
            GSK3: 'DATE#' + record.lastChangedDate.toISOString(),
            GPK4: 'CREATEDBY#' + record.createdByUUID,
            GSK4: 'DATE#' + record.lastChangedDate.toISOString(),
            GPK5: 'UPDATEDBY#' + record.lastChangedByUUID,
            GSK5: 'DATE#' + record.lastChangedDate.toISOString(),
        };
        const recordDynamoV1 = {
            ...record,
            PK: 'RECORD#' + record.recordUUID,
            SK: 'VERSION#1',
        };
        try {
            recordMetadata_1.recordSchemaDynamoLatest.parse(recordDynamoLatest);
            recordMetadata_1.recordSchemaDynamoVersion.parse(recordDynamoV1);
        }
        catch (e) {
            return (0, common_utils_1.bad)(e, 'Bad output record');
        }
        await ddb
            .putItem({
            TableName: process.env.record_table,
            Item: common_utils_1.DynamoDB.marshall(recordDynamoV1),
        })
            .promise();
        await ddb
            .putItem({
            TableName: process.env.record_table,
            Item: common_utils_1.DynamoDB.marshall(recordDynamoLatest),
        })
            .promise();
        return (0, common_utils_1.good)(record);
    }
    catch (e) {
        return (0, common_utils_1.bad)(e, 'Generic error');
    }
};
exports.handler = handler;
