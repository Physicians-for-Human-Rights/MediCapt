import _ from 'lodash'
import { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda'
import AWS from 'aws-sdk'
AWS.config.update({
  region: process.env.AWS_REGION,
})
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
    }
  }
}

import {
  good,
  bad,
  machineIdToHumanId,
  convertCognitoUser,
  findUserAttribute,
} from 'common-utils'
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
      event.pathParameters.username
    ) {
      var poolId = event.pathParameters.poolId
      var username = event.pathParameters.username
      try {
        var user_pool_id: string
        switch (poolId) {
          case 'Provider':
            user_pool_id = process.env.user_pool_provider
            break
          case 'Associate':
            user_pool_id = process.env.user_pool_associate
            break
          case 'Manager':
            user_pool_id = process.env.user_pool_manager
            break
          case 'FormDesigner':
            user_pool_id = process.env.user_pool_formdesigner
            break
          case 'Researcher':
            user_pool_id = process.env.user_pool_researcher
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

    await cognito
      .adminResetUserPassword({
        UserPoolId: user_pool_id,
        Username: username,
      })
      .promise()

    return good({})
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
