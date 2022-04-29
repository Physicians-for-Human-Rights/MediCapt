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
      form_table: string
      form_bucket: string
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
  FormMetadata,
  formMetadataSchema,
  formMetadataSchemaStrip,
  formManifestWithMD5Schema,
  FormFileWithPostLink,
  FormManifestWithPostLinks,
  FormFileWithMD5Schema,
} from 'utils/types/formMetadata'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    if (event.pathParameters && event.pathParameters.formId) {
      var formId = event.pathParameters.formId
    } else {
      return bad(event.pathParameters, 'Missing event parameters')
    }
    try {
      const json = JSON.parse(event.body!)
      var metadata = formMetadataSchema.parse(json.metadata) as FormMetadata
      var manifest = formManifestWithMD5Schema.parse(json.manifest)
    } catch (e) {
      return bad(e, 'Bad input form')
    }
    try {
      var item = await ddb
        .getItem({
          TableName: process.env.form_table,
          Key: {
            PK: { S: 'FORM#' + formId },
            SK: { S: 'VERSION#latest' },
          },
        })
        .promise()
    } catch (e) {
      return bad(e, 'No form exists to update')
    }
    try {
      var existingForm = formMetadataSchemaStrip.parse(
        DynamoDB.unmarshall(item.Item)
      )
    } catch (e) {
      return bad(e, 'Bad form data')
    }

    if (existingForm.version !== metadata.version)
      return bad([existingForm.version, metadata.version], 'Out of date form')

    if (metadata.manifestHash) {
      // Otherwise the manifest is new
      const contents: FormFileWithPostLink[] = []

      async function createFileLink(v: FormFileWithMD5Schema) {
        const filename = hashFilename(
          existingForm.formUUID,
          v.sha256,
          v.filetype
        )
        const exists = await s3ObjectExists(
          process.env.form_bucket,
          filename,
          s3
        )
        // Don't send upload links for existing resources
        if (exists) return
        const link = s3.createPresignedPost({
          Bucket: process.env.form_bucket,
          Fields: {
            key: filename,
            'Content-MD5': v.md5,
          },
          Expires: 600,
          Conditions: [
            // Images should not be larger than 1MB
            ['content-length-range', 0, 1000000],
            ['eq', '$x-amz-server-side-encryption', 'aws:kms'],
          ],
        })
        link.fields['x-amz-server-side-encryption'] = 'aws:kms'
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
        process.env.form_bucket,
        hashFilename(existingForm.formUUID, metadata.manifestHash, 'manifest'),
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

      const fullManifest: FormManifestWithPostLinks = {
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
