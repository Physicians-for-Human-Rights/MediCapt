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
      humanid_lambda: string
      location_table: string
    }
  }
}

import { good, bad, DynamoDB } from 'common-utils'
import { LocationType, locationSchema } from 'utils/types/location'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    try {
      var location = locationSchema.parse(
        JSON.parse(event.body!)
      ) as LocationType
    } catch (e) {
      return bad(e, 'Bad input location')
    }

    await ddb
      .deleteItem({
        TableName: process.env.location_table,
        Key: {
          PK: { S: 'LOCATION#' + location.locationUUID },
          SK: { S: 'VERSION#latest' },
        },
      })
      .promise()

    await ddb
      .putItem({
        TableName: process.env.location_table,
        Item: {
          PK: { S: 'LOCATION#' + location.locationUUID },
          SK: { S: 'VERSION#deleted' },
        },
      })
      .promise()

    return good(location.locationUUID)
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
