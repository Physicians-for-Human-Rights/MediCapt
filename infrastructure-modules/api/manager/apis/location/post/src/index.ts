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

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      humanid_lambda: string
      location_table: string
    }
  }
}

import { good, bad, machineIdToHumanId } from 'common-utils'
import {
  LocationType,
  locationCreationSchema,
  locationSchema,
} from 'common-types'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    try {
      var location = locationCreationSchema.parse(
        JSON.parse(event.body!)
      ) as LocationType
    } catch (e) {
      return bad(e, 'Bad input location')
    }
    const locationUUID = uuidv4()
    const ids = await machineIdToHumanId(locationUUID, 'ML', lambda)
    location.version = '1'
    location.createdDate = new Date()
    location.createdByUUID = event.requestContext.authorizer.claims.sub
    location.enabled = false
    location.enabledDate = new Date()
    location.enabledSetByUUID = event.requestContext.authorizer.claims.sub
    location.locationUUID = ids.machineID
    location.locationID = ids.humanID
    location.lastChangedByUUID = event.requestContext.authorizer.claims.sub
    location.lastChangedDate = new Date()
    try {
      locationSchema.parse(location)
    } catch (e) {
      return bad(e, 'Bad output location')
    }
    await ddb
      .putItem({
        TableName: process.env.location_table,
        Item: {
          locationUUID: { S: location.locationUUID },
          locationID: { S: location.locationID },
          country: { S: location.country },
          language: { S: location.language },
          legalName: { S: location.legalName },
          shortName: { S: location.shortName },
          entityType: { S: location.entityType },
          address: { S: location.address },
          mailingAddress: { S: location.mailingAddress },
          coordinates: { S: location.coordinates },
          phoneNumber: { S: location.phoneNumber },
          email: { S: location.email },
          createdDate: { S: location.createdDate.toString() },
          createdByUUID: { S: location.createdByUUID },
          enabled: { BOOL: location.enabled },
          enabledDate: { S: location.enabledDate.toString() },
          enabledSetByUUID: { S: location.enabledSetByUUID },
          tags: { S: location.tags || '' },
          version: { S: location.version },
          lastChangedByUUID: { S: location.lastChangedByUUID },
          lastChangedDate: { S: location.lastChangedDate.toString() },
          locationStorageVersion: { S: location['storage-version'] },
        },
      })
      .promise()
    return good(location)
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
