import _ from 'lodash'
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
      location_table: string
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

import {
  good,
  bad,
  multiplePages,
  findUserAttribute,
  verifyValue,
  convertCognitoUser,
} from 'common-utils'
import {
  queryFilterSchema,
  QueryFilterForType,
  querySortSchema,
  QueryFilterMatching,
  QuerySort,
} from 'utils/types/url'
import {
  UserType,
  userSchema,
  userTypeSchema,
  UserTypeFilter,
} from 'utils/types/user'
import {
  UserType as CognitoUserType,
  ListUsersResponse,
} from 'aws-sdk/clients/cognitoidentityserviceprovider'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    let startKey = undefined as undefined | AWS.DynamoDB.Key
    let filter = [] as QueryFilterForType<UserTypeFilter>
    if (
      event.queryStringParameters &&
      'userType' in event.queryStringParameters &&
      event.queryStringParameters['userType']
    ) {
      try {
        var userType = userTypeSchema.parse(
          JSON.parse(event.queryStringParameters['userType'])
        )
        var user_pool_id: string
        var image_bucket_id: string
        switch (userType) {
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
            return bad(userType, 'Bad user type key')
        }
      } catch (e) {
        return bad(e, 'Bad user type key')
      }
    } else {
      return bad([], 'Must specify a valid user type')
    }

    if (
      event.queryStringParameters &&
      'nextKey' in event.queryStringParameters &&
      event.queryStringParameters['nextKey']
    ) {
      try {
        startKey = JSON.parse(event.queryStringParameters['nextKey'])
      } catch (e) {
        return bad(e, 'Bad next key')
      }
    }
    if (
      event.queryStringParameters &&
      'filter' in event.queryStringParameters &&
      event.queryStringParameters['filter']
    ) {
      try {
        filter = queryFilterSchema.parse(
          JSON.parse(event.queryStringParameters['filter'])
        ) as QueryFilterForType<UserTypeFilter>
      } catch (e) {
        return bad(e, 'Bad query filter')
      }
    }
    const combinedFilters: Record<string, QueryFilterMatching> = _.merge.apply(
      null,
      // @ts-ignore
      filter
    )

    let cognitoItems: CognitoUserType[] = []
    let lastKey: undefined | string = undefined
    if (
      'allowed_locations' in combinedFilters &&
      'eq' in combinedFilters['allowed_locations']
    ) {
      const pool = user_pool_id
      const location = combinedFilters['allowed_locations'].eq
      const response = await multiplePages<CognitoUserType, ListUsersResponse>(
        undefined,
        async token => {
          return await cognito
            .listUsersInGroup({
              UserPoolId: pool,
              GroupName: location,
              NextToken: token,
            })
            .promise()
        },
        r => (r.Users ? r.Users : []),
        r => r.PaginationToken,
        10
      )
      cognitoItems = response.items
      lastKey = response.nextToken
    } else {
      const pool = user_pool_id
      const response = await multiplePages<CognitoUserType, ListUsersResponse>(
        undefined,
        async token => {
          return await cognito
            .listUsers({
              UserPoolId: pool,
              PaginationToken: token,
            })
            .promise()
        },
        r => (r.Users ? r.Users : []),
        r => r.PaginationToken,
        10
      )
      cognitoItems = response.items
      lastKey = response.nextToken
    }

    try {
      const rawItems = _.map(cognitoItems, u =>
        convertCognitoUser(u, image_bucket_id, userType, s3)
      )

      var items = _.filter(
        rawItems,
        e =>
          ('status' in combinedFilters && 'eq' in combinedFilters.status
            ? e.status === combinedFilters.status.eq
            : true) &&
          ('username' in combinedFilters &&
          'contains' in combinedFilters.username
            ? _.includes(
                _.toLower(e.username),
                _.toLower(combinedFilters.username.contains)
              )
            : true) &&
          ('email' in combinedFilters && 'contains' in combinedFilters.email
            ? _.includes(
                _.toLower(e.email),
                _.toLower(combinedFilters.email.contains)
              )
            : true) &&
          ('phone-number' in combinedFilters &&
          'contains' in combinedFilters['phone-number']
            ? _.includes(
                e['phone_number'],
                combinedFilters['phone-number'].contains
              )
            : true) &&
          ('name' in combinedFilters && 'contains' in combinedFilters.name
            ? _.includes(
                _.toLower(e['name']),
                _.toLower(combinedFilters.name.contains)
              )
            : true) &&
          ('user-id-code' in combinedFilters &&
          'contains' in combinedFilters['user-id-code']
            ? _.includes(e.userID, combinedFilters['user-id-code'].contains)
            : true) &&
          ('userType' in combinedFilters && 'eq' in combinedFilters.userType
            ? e.userType === combinedFilters.userType.eq
            : true)
      )
    } catch (e) {
      return bad([e, cognitoItems], 'Bad DB data')
    }
    return good({ items: items, nextKey: lastKey })
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
