import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda'
import AWS from 'aws-sdk'
AWS.config.update({
  region: process.env.AWS_REGION,
})
const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' })
var lambda = new AWS.Lambda({
  apiVersion: '2015-03-31',
  region: process.env.AWS_REGION,
})

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      humanid_lambda: string
      record_table: string
      record_table_kms: string
    }
  }
}

import { good, bad, machineIdToHumanId, DynamoDB } from 'common-utils'
import {
  recordMetadataSchemaByUser,
  RecordMetadataByUser,
  RecordMetadata,
  recordSchemaDynamoLatest,
  RecordDynamoLatestType,
} from 'utils/types/recordMetadata'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    try {
      var recordCreation = recordMetadataSchemaByUser.parse(
        JSON.parse(event.body!)
      ) as RecordMetadataByUser
    } catch (e) {
      return bad(e, 'Bad input record')
    }

    const recordUUID = uuidv4()
    const ids = await machineIdToHumanId(
      recordUUID,
      'MR',
      lambda,
      process.env.humanid_lambda
    )
    const patientUUID = uuidv4()
    const patientId = await machineIdToHumanId(
      recordUUID,
      'MP',
      lambda,
      process.env.humanid_lambda
    )
    const record: RecordMetadata = {
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
      patches: [],
    }
    const recordDynamoLatest: RecordDynamoLatestType = {
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
    }
    try {
      recordSchemaDynamoLatest.parse(recordDynamoLatest)
    } catch (e) {
      return bad(e, 'Bad output record')
    }
    await ddb
      .putItem({
        TableName: process.env.record_table,
        Item: DynamoDB.marshall(recordDynamoLatest),
      })
      .promise()
    return good(record)
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
