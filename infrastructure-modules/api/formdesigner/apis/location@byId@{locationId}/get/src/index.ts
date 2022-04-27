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
      location_table: string
      location_gsi_id: string
    }
  }
}

import {
  isUUIDOrInternalID,
  good,
  bad,
  DynamoDB,
  simpleDynamoQuery,
} from 'common-utils'
import { locationSchemaStrip } from 'utils/types/location'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    if (event.pathParameters && event.pathParameters.locationId) {
      var locationId = event.pathParameters.locationId
    } else {
      return bad(event.pathParameters, 'Missing event parameters')
    }
    let item
    if (isUUIDOrInternalID(locationId)) {
      try {
        const result = await ddb
          .getItem({
            TableName: process.env.location_table,
            Key: {
              PK: { S: 'LOCATION#' + locationId },
              SK: { S: 'VERSION#latest' },
            },
          })
          .promise()
        item = locationSchemaStrip.parse(DynamoDB.unmarshall(result.Item))
      } catch (e) {
        return bad(e, 'Failed to get UUID item')
      }
    } else {
      try {
        const results = await simpleDynamoQuery(
          ddb,
          undefined,
          process.env.location_table,
          process.env.location_gsi_id,
          'GPK1',
          'LOCATION#' + locationId,
          'GSK1',
          'VERSION#latest'
        )
        item = locationSchemaStrip.parse(DynamoDB.unmarshall(results.Items![0]))
      } catch (e) {
        return bad([e, process.env.location_gsi_id], 'Failed to get ID item')
      }
    }
    try {
      return good(item)
    } catch (e) {
      return bad([item, e], 'Got bad item')
    }
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
