import _ from 'lodash'
import { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda'
import AWS from 'aws-sdk'
AWS.config.update({
  region: process.env.AWS_REGION,
})
const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' })
var lambda = new AWS.Lambda({
  apiVersion: '2015-03-31',
  region: process.env.AWS_REGION,
})

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      location_table: string
      location_gsi_id: string
      location_gsi_date: string
      location_gsi_language: string
      location_gsi_country: string
      location_gsi_entity: string
    }
  }
}

import { good, bad, DynamoDB, simpleDynamoQuery } from 'common-utils'
import {
  LocationType,
  locationSchema,
  locationSchemaStrip,
} from 'utils/types/location'

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
    const item = await ddb
      .getItem({
        TableName: process.env.location_table,
        Key: {
          PK: { S: 'LOCATION#' + locationId },
          SK: { S: 'VERSION#latest' },
        },
      })
      .promise()
    try {
      return good({
        item: locationSchemaStrip.parse(DynamoDB.unmarshall(item.Item)),
      })
    } catch (e) {
      return bad([item, e], 'Got bad item')
    }
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
