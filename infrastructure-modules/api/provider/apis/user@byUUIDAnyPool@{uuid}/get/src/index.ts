import _ from 'lodash'
import { UserType as CognitoUserType } from 'aws-sdk/clients/cognitoidentityserviceprovider'
import { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda'
import { UserTypeList } from 'utils/types/user'
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
    if (event.pathParameters && event.pathParameters.uuid) {
      var userUUID = event.pathParameters.uuid
    } else {
      return bad(event.pathParameters, 'Missing event parameters')
    }
    let user: Partial<UserType> | null = null
    for (const pool of [
      {
        name: 'Provider',
        user_pool_id: process.env.user_pool_provider,
        image_bucket_id: process.env.image_bucket_provider,
      },

      {
        name: 'Associate',
        user_pool_id: process.env.user_pool_associate,
        image_bucket_id: process.env.image_bucket_associate,
      },

      {
        name: 'Manager',
        user_pool_id: process.env.user_pool_manager,
        image_bucket_id: process.env.image_bucket_manager,
      },

      {
        name: 'FormDesigner',
        user_pool_id: process.env.user_pool_formdesigner,
        image_bucket_id: process.env.image_bucket_formdesigner,
      },
      {
        name: 'Researcher',
        user_pool_id: process.env.user_pool_researcher,
        image_bucket_id: process.env.image_bucket_researcher,
      },
    ] as {
      name: UserTypeList
      user_pool_id: string
      image_bucket_id: string
    }[]) {
      try {
        const r = await cognito
          .listUsers({
            UserPoolId: pool.user_pool_id,
            // TODO Sanitize this userUUID
            Filter: 'sub = "' + userUUID + '"',
          })
          .promise()
        if (r.Users && r.Users.length === 1) {
          const cognitoUser: CognitoUserType = r.Users[0]
          user = convertCognitoUser(
            cognitoUser,
            pool.image_bucket_id,
            pool.name,
            s3
          )
          break
        }
      } catch (e) {
        continue
      }
    }
    if (!user) return bad(null, 'Could not look up cognito user')
    return good(user)
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
