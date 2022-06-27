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
      record_table: string
      record_table_kms: string
      record_bucket: string
      record_bucket_kms: string
    }
  }
}

import { good, bad, DynamoDB, hashFilename } from 'common-utils'
import {
  recordMetadataSchemaStrip,
  RecordManifestFileWithLink,
  RecordManifestWithLinks,
  RecordManifestFile,
  recordManifestSchema,
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
    const item = await ddb
      .getItem({
        TableName: process.env.record_table,
        Key: {
          PK: { S: 'RECORD#' + recordId },
          SK: { S: 'VERSION#latest' },
        },
      })
      .promise()
    try {
      const record = recordMetadataSchemaStrip.parse(
        DynamoDB.unmarshall(item.Item)
      )
      function createLink(v: RecordManifestFile): RecordManifestFileWithLink {
        return {
          sha256: v.sha256,
          filetype: v.filetype,
          filename: v.filename,
          link: s3.getSignedUrl('getObject', {
            Bucket: process.env.record_bucket,
            Key: hashFilename(record.recordUUID, v.sha256, v.filetype),
            // 10 minutes is a long time, but it might be needed for slow
            // connections.
            Expires: 600,
          }),
        }
      }
      if (record.manifestHash) {
        const manifestObject = await s3
          .getObject({
            Bucket: process.env.record_bucket,
            Key: hashFilename(
              record.recordUUID,
              record.manifestHash,
              'manifest'
            ),
          })
          .promise()
        if (!manifestObject.Body) return bad(manifestObject, 'Empty manifest')
        const body = recordManifestSchema.parse(
          JSON.parse(manifestObject.Body.toString('utf-8'))
        )
        const fullManifest: RecordManifestWithLinks = {
          'storage-version': '1.0.0',
          root: body.root,
          contents: _.map(body.contents, v => createLink(v)),
        }
        return good({
          metadata: record,
          manifest: fullManifest,
          manifestLink: createLink({
            sha256: record.manifestHash,
            filetype: 'manifest',
            filename: 'manifest',
          }),
        })
      } else {
        // The record is empty
        return good({
          metadata: record,
          manifest: {
            'storage-version': '1.0.0',
            root: '',
            contents: [],
          },
        })
      }
    } catch (e) {
      return bad([item, e], 'Got bad item')
    }
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
