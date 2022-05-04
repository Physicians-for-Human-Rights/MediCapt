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
      record_table_kms: string
      record_bucket: string
      record_bucket_kms: string
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
  RecordMetadata,
  recordMetadataSchema,
  recordMetadataSchemaStrip,
  recordManifestWithMD5Schema,
  RecordFileWithPostLink,
  RecordManifestWithPostLinks,
  RecordFileWithMD5Schema,
} from 'utils/types/recordMetadata'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    if (event.pathParameters && event.pathParameters.recordId) {
      var recordId = event.pathParameters.recordId
    } else {
      return bad(event.pathParameters, 'Missing event parameters')
    }
    try {
      const json = JSON.parse(event.body!)
      var metadata = recordMetadataSchema.parse(json.metadata) as RecordMetadata
      var manifest = recordManifestWithMD5Schema.parse(json.manifest)
    } catch (e) {
      return bad(e, 'Bad input record')
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

    if (existingRecord.version !== metadata.version)
      return bad(
        [existingRecord.version, metadata.version],
        'Out of date record'
      )

    if (metadata.manifestHash) {
      // Otherwise the manifest is new
      const contents: RecordFileWithPostLink[] = []

      async function createFileLink(v: RecordFileWithMD5Schema) {
        const filename = hashFilename(
          existingRecord.recordUUID,
          v.sha256,
          v.filetype
        )
        const exists = await s3ObjectExists(
          process.env.record_bucket,
          filename,
          s3
        )
        // Don't send upload links for existing resources
        if (exists) return
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
        })
        link.fields['x-amz-server-side-encryption'] = 'aws:kms'
        // link.fields['x-amz-server-side-encryption-aws-kms-key-id'] =
        //   process.env.record_bucket_kms
        contents.push({
          sha256: v.sha256,
          filetype: v.filetype,
          filename: v.filename,
          link,
        })
      }

      // NB It doesn't matter if the manifest already exists. If it does, we
      // won't produce a link for it. But, if the client starts the upload, then
      // disconnects, and later wants to continue uploading, it needs the
      // ability to continue with a manifest that already exists.
      //
      // If we could guarantee this never happens, we would be able to just exit
      // early, since we're reverting to a prior version.
      const manifestExists = await s3ObjectExists(
        process.env.record_bucket,
        hashFilename(
          existingRecord.recordUUID,
          metadata.manifestHash,
          'manifest'
        ),
        s3
      )
      if (!manifestExists) {
        await createFileLink({
          md5: metadata.manifestMD5,
          sha256: metadata.manifestHash,
          filename: 'manifest',
          filetype: 'manifest',
        })
      }

      await Promise.all(
        _.map(manifest.contents, async v => await createFileLink(v))
      )

      const fullManifest: RecordManifestWithPostLinks = {
        'storage-version': '1.0.0',
        root: manifest.root,
        contents: contents,
      }

      return good({
        metadata,
        manifest: fullManifest,
      })
    }
    return bad([], 'Missing manifest hash')
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
