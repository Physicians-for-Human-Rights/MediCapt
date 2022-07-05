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

import { good, bad, isBad, DynamoDB, hashFilename, getForm } from 'common-utils'
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
    const form = await getForm(
      ddb,
      s3,
      process.env.form_table,
      process.env.form_bucket,
      formId,
      formVersion
    )
    if ('statusCode' in form) {
      return form
    }
    return good(form)
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
