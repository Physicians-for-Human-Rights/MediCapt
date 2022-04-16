import { v4 as uuidv4 } from 'uuid'
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
const cognito = new AWS.CognitoIdentityServiceProvider({
  apiVersion: '2016-04-18',
})

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      humanid_lambda: string
      location_table: string
      user_pool_provider: string
      user_pool_associate: string
      user_pool_manager: string
      user_pool_formdesigner: string
      user_pool_researcher: string
    }
  }
}

import { good, bad, machineIdToHumanId, DynamoDB } from 'common-utils'
import {
  LocationType,
  locationSchemaByUser,
  LocationByUserType,
  locationSchemaDynamoLatest,
  LocationDynamoLatestType,
  locationSchemaDynamoVersion,
  LocationDynamoVersionType,
} from 'utils/types/location'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    try {
      var locationCreation = locationSchemaByUser.parse(
        JSON.parse(event.body!)
      ) as LocationByUserType
    } catch (e) {
      return bad(e, 'Bad input location')
    }
    const locationUUID = uuidv4()
    const ids = await machineIdToHumanId(locationUUID, 'ML', lambda)
    const location: LocationType = {
      ...locationCreation,
      version: '1',
      createdDate: new Date(),
      createdByUUID: event.requestContext.authorizer.claims.sub,
      enabled: false,
      locationUUID: ids.machineID,
      locationID: ids.humanID,
      lastChangedByUUID: event.requestContext.authorizer.claims.sub,
      lastChangedDate: new Date(),
    }
    const locationDynamoLatest: LocationDynamoLatestType = {
      ...location,
      PK: 'LOCATION#' + location.locationUUID,
      SK: 'VERSION#latest',
      GPK1: 'LOCATION#' + location.locationID,
      GSK1: 'VERSION#latest',
      GPK2: 'VERSION#latest',
      GSK2: 'DATE#' + location.lastChangedDate.toISOString(),
      GPK3: 'LA#' + location.language,
      GSK3: 'DATE#' + location.lastChangedDate.toISOString(),
      GPK4: 'CA#' + location.country,
      GSK4: 'DATE#' + location.lastChangedDate.toISOString(),
      GPK5: 'ET#' + location.entityType,
      GSK5: 'DATE#' + location.lastChangedDate.toISOString(),
    }
    const locationDynamoV1: LocationDynamoVersionType = {
      ...location,
      PK: 'LOCATION#' + location.locationUUID,
      SK: 'VERSION#1',
    }
    try {
      locationSchemaDynamoLatest.parse(locationDynamoLatest)
      locationSchemaDynamoVersion.parse(locationDynamoV1)
    } catch (e) {
      return bad(e, 'Bad output location')
    }
    await ddb
      .putItem({
        TableName: process.env.location_table,
        Item: DynamoDB.marshall(locationDynamoV1),
      })
      .promise()
    await ddb
      .putItem({
        TableName: process.env.location_table,
        Item: DynamoDB.marshall(locationDynamoLatest),
      })
      .promise()

    await Promise.all(
      _.map(
        [
          process.env.user_pool_provider,
          process.env.user_pool_associate,
          process.env.user_pool_manager,
          process.env.user_pool_formdesigner,
          process.env.user_pool_researcher,
        ],
        async p =>
          await cognito
            .createGroup({
              GroupName: location.locationUUID,
              UserPoolId: p,
              Description: location.legalName,
            })
            .promise()
      )
    )
    return good(location)
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
