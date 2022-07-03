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
      form_table: string
      form_bucket: string
    }
  }
}

import { good, bad, DynamoDB, hashFilename } from 'common-utils'
import {
  formMetadataSchemaStrip,
  formManifestSchema,
  FormManifestFileWithLink,
  FormManifestWithLinks,
  FormManifestFile,
} from 'utils/types/formMetadata'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    if (
      event.pathParameters &&
      event.pathParameters.formId &&
      event.pathParameters.formVersion
    ) {
      var formId = event.pathParameters.formId
      var formVersion = event.pathParameters.formVersion
    } else {
      return bad(event.pathParameters, 'Missing event parameters')
    }
    const item = await ddb
      .getItem({
        TableName: process.env.form_table,
        Key: {
          PK: { S: 'FORM#' + formId },
          SK: { S: 'VERSION#' + formVersion },
        },
      })
      .promise()
    try {
      const form = formMetadataSchemaStrip.parse(DynamoDB.unmarshall(item.Item))
      function createLink(v: FormManifestFile): FormManifestFileWithLink {
        return {
          sha256: v.sha256,
          filetype: v.filetype,
          filename: v.filename,
          link: s3.getSignedUrl('getObject', {
            Bucket: process.env.form_bucket,
            Key: hashFilename(form.formUUID, v.sha256, v.filetype),
            ResponseCacheControl: `private, max-age=31536000, immutable`,
            // 10 minutes is a long time, but it might be needed for slow
            // connections.
            Expires: 600,
          }),
        }
      }
      if (form.manifestHash) {
        const manifestObject = await s3
          .getObject({
            Bucket: process.env.form_bucket,
            Key: hashFilename(form.formUUID, form.manifestHash, 'manifest'),
          })
          .promise()
        if (!manifestObject.Body) return bad(manifestObject, 'Empty manifest')
        const body = formManifestSchema.parse(
          JSON.parse(manifestObject.Body.toString('utf-8'))
        )
        const fullManifest: FormManifestWithLinks = {
          'storage-version': '1.0.0',
          root: body.root,
          contents: _.map(body.contents, v => createLink(v)),
        }
        return good({
          metadata: form,
          manifest: fullManifest,
          manifestLink: createLink({
            sha256: form.manifestHash,
            filetype: 'manifest',
            filename: 'manifest',
          }),
        })
      } else {
        // The form is empty
        return good({
          metadata: form,
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
