import _ from 'lodash'
import { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda'
import AWS from 'aws-sdk'
AWS.config.update({
  region: process.env.AWS_REGION,
})
const s3 = new AWS.S3({ signatureVersion: 'v4', apiVersion: '2006-03-01' })
const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' })

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      humanid_lambda: string
      record_table: string
    }
  }
}

import {
  good,
  bad,
  DynamoDB,
  zodDynamoUpdateExpression,
  zodDynamoAttributeValues,
  zodDynamoAttributeNames,
  hashFilename,
} from 'common-utils'
import {
  RecordMetadata,
  recordMetadataSchema,
  recordSchemaDynamoLatestToUpdate,
  recordSchemaUpdateSeal,
  recordMetadataSchemaStrip,
  RecordDynamoUpdateSeal,
} from 'utils/types/recordMetadata'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    if (event.pathParameters && event.pathParameters.recordId) {
      var recordId = event.pathParameters.recordId
    } else {
      return bad(event.pathParameters, 'Missing recordId parameter')
    }
    try {
      var record = recordMetadataSchema.parse(
        JSON.parse(event.body!)
      ) as RecordMetadata
    } catch (e) {
      return bad(e, 'Bad input record')
    }

    // Get the existing entry, validate that it exists
    try {
      var item = await ddb
        .getItem({
          TableName: process.env.record_table,
          Key: {
            PK: { S: 'RECORD#' + recordId },
            SK: { S: 'VERSION#latest' },
          },
        })
        .promise()
    } catch (e) {
      return bad(e, 'No record exists to update')
    }
    try {
      var existingRecord = recordMetadataSchemaStrip.parse(
        DynamoDB.unmarshall(item.Item)
      )
    } catch (e) {
      return bad(e, 'Bad record data')
    }

    if (existingRecord.sealed)
      return bad(existingRecord, 'Record already sealed')

    const now = new Date()
    let updateLatest: RecordDynamoUpdateSeal = {
      lastChangedByUUID: event.requestContext.authorizer.claims.sub,
      lastChangedDate: now,
      version: _.toString(_.toNumber(record.version) + 1),
      sealed: true,
    }

    // Update latest, verifying that the version hasn't changed.
    try {
      var response = await ddb
        .updateItem({
          TableName: process.env.record_table,
          Key: {
            PK: { S: 'RECORD#' + recordId },
            SK: { S: 'VERSION#latest' },
          },
          ReturnValues: 'ALL_NEW',
          UpdateExpression: zodDynamoUpdateExpression(
            recordSchemaUpdateSeal,
            updateLatest
          ),
          ExpressionAttributeNames: zodDynamoAttributeNames(
            recordSchemaUpdateSeal,
            updateLatest
          ),
          ExpressionAttributeValues: {
            ...zodDynamoAttributeValues(recordSchemaUpdateSeal, updateLatest),
            ':oldVersion': { S: record.version },
          },
          ConditionExpression: '#version = :oldVersion',
        })
        .promise()
    } catch (e) {
      return bad([], 'Record is out of date or does not exist')
    }
    try {
      const newRecord = recordMetadataSchemaStrip.parse(
        DynamoDB.unmarshall(_.mapValues(response.Attributes))
      )

      await s3.upload({
        Bucket: process.env.record_bucket,
        Key: hashFilename(
          existingRecord.recordUUID,
          existingRecord.manifestHash,
          'metadata'
        ),
        Body: JSON.stringify(newRecord),
      })

      return good({ record: newRecord })
    } catch (e) {
      return bad(e, 'Unknown error')
    }
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
