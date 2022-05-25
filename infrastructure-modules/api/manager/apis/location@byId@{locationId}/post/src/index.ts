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

import {
  good,
  bad,
  DynamoDB,
  zodDynamoUpdateExpression,
  zodDynamoAttributeValues,
  zodDynamoAttributeNames,
} from 'common-utils'
import {
  LocationDynamoLatestToUpdateType,
  LocationDynamoVersionType,
  LocationDynamoUpdateType,
  LocationType,
  locationSchema,
  locationSchemaByUser,
  locationSchemaDynamoVersion,
  locationSchemaStrip,
  locationSchemaDynamoLatestToUpdate,
} from 'utils/types/location'

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
    const userUpdate = locationSchemaByUser.parse(location)
    const update: LocationDynamoUpdateType = {
      ...userUpdate,
      lastChangedByUUID: event.requestContext.authorizer.claims.sub,
      lastChangedDate: new Date(),
      version: _.toString(_.toNumber(location.version) + 1),
    }
    const now = new Date()
    const updateLatest: LocationDynamoLatestToUpdateType = {
      ...update,
      GSK2: 'DATE#' + now.toISOString(),
      GPK3: 'LA#' + update.language,
      GSK3: 'DATE#' + now.toISOString(),
      GPK4: 'CA#' + update.country,
      GSK4: 'DATE#' + now.toISOString(),
      GPK5: 'ET#' + update.entityType,
      GSK5: 'DATE#' + now.toISOString(),
    }

    // Update latest, verifying that the version hasn't changed.
    try {
      var response = await ddb
        .updateItem({
          TableName: process.env.location_table,
          Key: {
            PK: { S: 'LOCATION#' + location.locationUUID },
            SK: { S: 'VERSION#latest' },
          },
          ReturnValues: 'ALL_NEW',
          UpdateExpression: zodDynamoUpdateExpression(
            locationSchemaDynamoLatestToUpdate
          ),
          ExpressionAttributeNames: zodDynamoAttributeNames(
            locationSchemaDynamoLatestToUpdate
          ),
          ExpressionAttributeValues: {
            ...zodDynamoAttributeValues(
              locationSchemaDynamoLatestToUpdate,
              updateLatest
            ),
            ':oldVersion': { S: location.version },
          },
          ConditionExpression: '#version = :oldVersion',
        })
        .promise()
    } catch (e) {
      return bad([], 'Location is out of date or does not exist')
    }
    try {
      const newLocation = locationSchemaStrip.parse(
        DynamoDB.unmarshall(_.mapValues(response.Attributes))
      )

      // Insert the versioned location for logging purposes
      const locationDynamoNextVersion: LocationDynamoVersionType = locationSchemaDynamoVersion.parse(
        {
          ...newLocation,
          PK: 'LOCATION#' + newLocation.locationUUID,
          SK: 'VERSION#' + newLocation.version,
        }
      )
      await ddb
        .putItem({
          TableName: process.env.location_table,
          Item: DynamoDB.marshall(locationDynamoNextVersion),
        })
        .promise()

      return good(newLocation)
    } catch (e) {
      return bad(e, 'Generic errorX')
    }
  } catch (e) {
    return bad(
      [
        e,
        zodDynamoUpdateExpression(locationSchemaDynamoLatestToUpdate),
        zodDynamoAttributeNames(locationSchemaDynamoLatestToUpdate),
      ],
      'Generic error'
    )
  }
}
