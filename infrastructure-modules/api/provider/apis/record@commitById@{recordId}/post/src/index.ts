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
  s3ObjectExists,
  s3ReadObjectJSON,
  hashFilename,
} from 'common-utils'
import {
  RecordDynamoLatestToUpdateType,
  RecordDynamoUpdateType,
  RecordMetadata,
  recordMetadataSchema,
  recordMetadataSchemaByUser,
  recordMetadataSchemaStrip,
  recordManifestSchema,
  recordSchemaDynamoLatestToUpdate,
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
      return bad([e, JSON.parse(event.body!)], 'Bad input record')
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

    // Verify that the new manifest is well-recorded
    try {
      var newManifest = recordManifestSchema.parse(
        await s3ReadObjectJSON(
          process.env.record_bucket,
          hashFilename(recordId, record.manifestHash, 'manifest'),
          s3
        )
      )
    } catch (e) {
      return bad(e, 'You did not upload a new manifest, or uploaded a bad one')
    }
    {
      if (newManifest.root) {
        const newRootEntry = _.find(
          newManifest.contents,
          e => e.sha256 === newManifest.root
        )
        if (!newRootEntry) {
          return bad([], 'If you have a root, it must exist')
        }
      }
    }

    // Check that all of the new files we promised to upload are actually there
    let hashesToCheck
    if (existingRecord.manifestHash) {
      const oldManifest = recordManifestSchema.parse(
        await s3ReadObjectJSON(
          process.env.record_bucket,
          hashFilename(
            existingRecord.recordUUID,
            existingRecord.manifestHash,
            'manifest'
          ),
          s3
        )
      )
      const oldHashes = _.map(oldManifest.contents, v => v.sha256)
      const newHashes = _.map(newManifest.contents, v => v.sha256)
      hashesToCheck = _.difference(newHashes, oldHashes)
    } else {
      hashesToCheck = _.map(newManifest.contents, v => v.sha256)
    }

    for (const hash of hashesToCheck) {
      const entry = _.find(newManifest.contents, e => e.sha256 === hash)
      if (!entry)
        return bad(
          [hash, hashesToCheck, newManifest],
          'Hash missing from manifest'
        )
      if (
        !(await s3ObjectExists(
          process.env.record_bucket,
          hashFilename(existingRecord.recordUUID, entry.sha256, entry.filetype),
          s3
        ))
      )
        return bad(entry, 'Required file not uploaded')
    }

    // We checked the manifest and metadata are well-recorded, that the root is
    // valid and exists, that the metadata table only refers to files that have
    // been uploaded. Time to commit the update.

    const userUpdate = recordMetadataSchemaByUser.strip().parse(record)
    const now = new Date()
    const update: RecordDynamoUpdateType = {
      ...userUpdate,
      lastChangedByUUID: event.requestContext.authorizer.claims.sub,
      lastChangedDate: now,
      version: _.toString(_.toNumber(record.version) + 1),
    }
    let updateLatest: RecordDynamoLatestToUpdateType = {
      ...update,
      GPK2: 'VERSION#latest',
      GSK2: 'DATE#' + now.toISOString(),
      GPK3: 'LO#' + update.locationID,
      GSK3: 'DATE#' + now.toISOString(),
      GPK4: 'CREATEDBY#' + existingRecord.createdByUUID,
      GSK4: 'DATE#' + now.toISOString(),
      GPK5: 'UPDATEDBY#' + existingRecord.lastChangedByUUID,
      GSK5: 'DATE#' + now.toISOString(),
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
            recordSchemaDynamoLatestToUpdate,
            updateLatest
          ),
          ExpressionAttributeNames: zodDynamoAttributeNames(
            recordSchemaDynamoLatestToUpdate,
            updateLatest
          ),
          ExpressionAttributeValues: {
            ...zodDynamoAttributeValues(
              recordSchemaDynamoLatestToUpdate,
              updateLatest
            ),
            ':oldVersion': { S: record.version },
          },
          ConditionExpression: '#version = :oldVersion',
        })
        .promise()
    } catch (e) {
      return bad(
        [
          e,
          recordSchemaDynamoLatestToUpdate,
          updateLatest,
          {
            TableName: process.env.record_table,
            Key: {
              PK: { S: 'RECORD#' + recordId },
              SK: { S: 'VERSION#latest' },
            },
            ReturnValues: 'ALL_NEW',
            UpdateExpression: zodDynamoUpdateExpression(
              recordSchemaDynamoLatestToUpdate,
              updateLatest
            ),
            ExpressionAttributeNames: zodDynamoAttributeNames(
              recordSchemaDynamoLatestToUpdate,
              updateLatest
            ),
            ExpressionAttributeValues: {
              ...zodDynamoAttributeValues(
                recordSchemaDynamoLatestToUpdate,
                updateLatest
              ),
              ':oldVersion': { S: record.version },
            },
            ConditionExpression: '#version = :oldVersion',
          },
        ],
        'Record is out of date, does not exist, or update failed'
      )
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

      return good({ record: newRecord, hashesToCheck })
    } catch (e) {
      return bad(e, 'Unknown error')
    }
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
