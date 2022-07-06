import _ from 'lodash'
import { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda'
import AWS from 'aws-sdk'
AWS.config.update({
  region: process.env.AWS_REGION,
})
const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' })

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      sharing_table: string
      sharing_gsi_by_date: string
      sharing_gsi_with_id: string
      sharing_gsi_with_date: string
      sharing_gsi_by_record: string
    }
  }
}

import { good, bad, DynamoDB, simpleDynamoQuery } from 'common-utils'
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
    if (event.pathParameters && event.pathParameters.recordId) {
      var recordId = event.pathParameters.recordId
    } else {
      return bad(event.pathParameters, 'Missing event parameters')
    }
    const results = await simpleDynamoQuery(
      ddb,
      startKey,
      process.env.sharing_table,
      process.env.sharing_gsi_by_record,
      'GPK4',
      'RECORD#' + recordId
    )
    const rawItems: AWS.DynamoDB.ItemList = results.Items ? results.Items : []
    const lastKey: undefined | AWS.DynamoDB.Key = results.LastEvaluatedKey
    try {
      var items: Share[] = _.map(rawItems, e =>
        shareSchemaStrip.parse(DynamoDB.unmarshall(e))
      )
    } catch (e) {
      return bad([e], 'Bad DB data')
    }

    return good({ items: items, nextKey: lastKey })
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
