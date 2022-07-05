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
      record_table: string
      sharing_table: string
      sharing_gsi_by_date: string
      sharing_gsi_with_id: string
      sharing_gsi_with_date: string
      sharing_gsi_by_record: string
    }
  }
}

import { good, bad, machineIdToHumanId, DynamoDB } from 'common-utils'
import {
  shareSchemaByUser,
  ShareByUser,
  shareSchemaStrip,
  shareSchemaDynamoToUpdate,
  ShareDynamoToUpdateType,
  Share,
} from 'utils/types/share'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    try {
      var shareCreation = shareSchemaByUser.parse(
        JSON.parse(event.body!)
      ) as ShareByUser
    } catch (e) {
      return bad(e, 'Bad input share')
    }

    if (event.pathParameters && event.pathParameters.recordId) {
      var recordId = event.pathParameters.recordId
    } else {
      return bad(event.pathParameters, 'Missing event parameters')
    }

    try {
      // TODO Will need to check that the user has permissions to this item
      await ddb
        .getItem({
          TableName: process.env.record_table,
          Key: {
            PK: { S: 'RECORD#' + recordId },
            SK: { S: 'VERSION#latest' },
          },
        })
        .promise()
    } catch (e) {
      bad([e], 'cannot look up record')
    }

    const shareUUID = uuidv4()
    const ids = await machineIdToHumanId(
      shareUUID,
      'MS',
      lambda,
      process.env.humanid_lambda
    )
    const share: Share = {
      ...shareCreation,
      recordUUID: recordId,
      shareUUID: ids.machineID,
      shareID: ids.humanID,
      createdDate: new Date(),
      createdByUUID: event.requestContext.authorizer.claims.sub,
      lastChangedDate: new Date(),
      lastChangedByUUID: event.requestContext.authorizer.claims.sub,
    }
    const shareDynamoLatest: ShareDynamoToUpdateType = {
      ...share,
      PK: 'BY#' + event.requestContext.authorizer.claims.sub,
      SK: 'ID#' + share.shareUUID,
      GPK1: 'BY#' + event.requestContext.authorizer.claims.sub,
      GSK1: 'DATE#' + share.lastChangedDate.toISOString(),
      GPK2: 'WITH#' + share.sharedWithUUID,
      GSK2: 'ID#' + share.shareUUID,
      GPK3: 'WITH#' + share.sharedWithUUID,
      GSK3: 'DATE#' + share.lastChangedDate.toISOString(),
      GPK4: 'RECORD#' + recordId,
      GSK4: 'DATE#' + share.lastChangedDate.toISOString(),
      TTL: share.shareExpiresOn.getTime(),
    }
    try {
      shareSchemaDynamoToUpdate.parse(shareDynamoLatest)
    } catch (e) {
      return bad(e, 'Bad output share')
    }
    try {
      await ddb
        .putItem({
          TableName: process.env.sharing_table,
          Item: DynamoDB.marshall(shareDynamoLatest),
        })
        .promise()
    } catch (e) {
      return bad([e, process.env.sharing_table], 'Failed to commit to dynamo')
    }
    return good(share)
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
