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
      sharing_table: string
      sharing_gsi_by_date: string
      sharing_gsi_with_id: string
      sharing_gsi_with_date: string
      sharing_gsi_by_record: string
      form_table: string
      form_bucket: string
      record_table: string
      record_bucket: string
    }
  }
}

import {
  good,
  bad,
  isBad,
  DynamoDB,
  simpleDynamoQuery,
  getForm,
  getRecord,
} from 'common-utils'
import { shareSchemaStrip, Share } from 'utils/types/share'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    let startKey = undefined as undefined | AWS.DynamoDB.Key
    if (
      event.queryStringParameters &&
      'nextKey' in event.queryStringParameters &&
      event.queryStringParameters['nextKey']
    ) {
      try {
        startKey = JSON.parse(event.queryStringParameters['nextKey'])
      } catch (e) {
        return bad(e, 'Bad next key')
      }
    }
    if (event.pathParameters && event.pathParameters.shareId) {
      var shareId = event.pathParameters.shareId
    } else {
      return bad(event.pathParameters, 'Missing event parameters')
    }
    const results = await simpleDynamoQuery(
      ddb,
      startKey,
      process.env.sharing_table,
      process.env.sharing_gsi_with_id,
      'GPK2',
      'WITH#' + event.requestContext.authorizer.claims.sub,
      'GSK2',
      'ID#' + shareId
    )
    const rawItems: AWS.DynamoDB.ItemList = results.Items ? results.Items : []
    if (rawItems && rawItems.length !== 1) {
      return bad([], 'Failed to find share')
    }
    try {
      var share: Share = shareSchemaStrip.parse(
        DynamoDB.unmarshall(rawItems[0])
      )
    } catch (e) {
      return bad([e], 'Bad DB data')
    }
    try {
      var form = await getForm(
        ddb,
        s3,
        process.env.form_table,
        process.env.form_bucket,
        share.formUUID,
        share.formVersion
      )
      if ('statusCode' in form) {
        return form
      }
    } catch (e) {
      return bad([e], 'Failed to get form')
    }
    try {
      var record = await getRecord(
        ddb,
        s3,
        process.env.record_table,
        process.env.record_bucket,
        share.recordUUID
      )
      if ('statusCode' in record) {
        return record
      }
    } catch (e) {
      return bad([e], 'Failed to get record')
    }
    return good({ share, form: form, record: record })
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
