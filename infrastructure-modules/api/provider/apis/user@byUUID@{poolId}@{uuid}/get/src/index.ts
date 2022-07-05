import _ from 'lodash'
import { UserType as CognitoUserType } from 'aws-sdk/clients/cognitoidentityserviceprovider'
import { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda'
import AWS from 'aws-sdk'
AWS.config.update({
  region: process.env.AWS_REGION,
})
const s3 = new AWS.S3({ signatureVersion: 'v4', apiVersion: '2006-03-01' })
const cognito = new AWS.CognitoIdentityServiceProvider({
  apiVersion: '2016-04-18',
})

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      user_pool_provider: string
      user_pool_associate: string
      user_pool_manager: string
      user_pool_formdesigner: string
      user_pool_researcher: string
      image_bucket_provider: string
      image_bucket_associate: string
      image_bucket_manager: string
      image_bucket_formdesigner: string
      image_bucket_researcher: string
    }
  }
}

import { good, bad, convertCognitoUser } from 'common-utils'
import {
  UserType,
  userSchema,
  userSchemaByUser,
  userTypeSchema,
  UserTypeFilter,
  splitLocations,
} from 'utils/types/user'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    if (
      event.pathParameters &&
      event.pathParameters.poolId &&
      event.pathParameters.uuid
    ) {
      var poolId = event.pathParameters.poolId
      var userUUID = event.pathParameters.uuid
      try {
        var user_pool_id: string
        var image_bucket_id: string
        switch (poolId) {
          case 'Provider':
            user_pool_id = process.env.user_pool_provider
            image_bucket_id = process.env.image_bucket_provider
            break
          case 'Associate':
            user_pool_id = process.env.user_pool_associate
            image_bucket_id = process.env.image_bucket_associate
            break
          case 'Manager':
            user_pool_id = process.env.user_pool_manager
            image_bucket_id = process.env.image_bucket_manager
            break
          case 'FormDesigner':
            user_pool_id = process.env.user_pool_formdesigner
            image_bucket_id = process.env.image_bucket_formdesigner
            break
          case 'Researcher':
            user_pool_id = process.env.user_pool_researcher
            image_bucket_id = process.env.image_bucket_researcher
            break
          default:
            return bad(poolId, 'Bad user type key')
        }
      } catch (e) {
        return bad(e, 'Bad user type key')
      }
    } else {
      return bad(event.pathParameters, 'Missing event parameters')
    }

    let cognitoUser: CognitoUserType | null = null
    try {
      const r = await cognito
        .listUsers({
          UserPoolId: user_pool_id,
          // TODO Sanitize this userUUID
          Filter: 'sub = "' + userUUID + '"',
        })
        .promise()
      if (r.Users && r.Users.length === 1) {
        cognitoUser = r.Users[0]
      } else bad(null, 'Cognito did not return one user for this uuid')
    } catch (e) {
      return bad(e, 'Could not get user from cognito')
    }

    if (!cognitoUser) return bad(null, 'Could not look up cognito user')
    const user = convertCognitoUser(cognitoUser, image_bucket_id, poolId, s3)

    return good(user)
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
