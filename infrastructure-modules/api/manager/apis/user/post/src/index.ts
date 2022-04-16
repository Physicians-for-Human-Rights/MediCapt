import { v4 as uuidv4 } from 'uuid'
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
var lambda = new AWS.Lambda({
  apiVersion: '2015-03-31',
  region: process.env.AWS_REGION,
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
  machineIdToHumanId,
  convertCognitoUser,
  findUserAttribute,
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
    try {
      var user = userSchemaByUser.parse(JSON.parse(event.body!)) as UserType
    } catch (e) {
      return bad(e, 'Bad input user')
    }

    const poolId = user.userType
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

    // Add the attribute to the update list if it isn't equal
    function addAttribute(name: string, val: any) {
      userAttributes.push({
        Name: name,
        Value: _.isDate(val) ? val.toISOString() : val,
      })
    }

    let userAttributes: AWS.CognitoIdentityServiceProvider.AttributeListType = []

    const newLocations = splitLocations(user.allowed_locations)
    const callerLocations = splitLocations(
      event.requestContext.authorizer.claims['custom:allowed_locations']
    )
    if (
      !_.isEqual(callerLocations, ['admin']) &&
      !_.isEqual(_.difference(newLocations, callerLocations), [])
    ) {
      return bad(
        [
          _.difference(newLocations, callerLocations),
          callerLocations,
          event.requestContext.authorizer,
          newLocations,
        ],
        'You are not allowed to add/remove users from this location'
      )
    }

    addAttribute('custom:storage_version', user['storage-version'])
    addAttribute('email', user['email'])
    addAttribute('birthdate', user['birthdate'])
    addAttribute('name', user['name'])
    addAttribute('nickname', user['nickname'])
    addAttribute('custom:formal_name', user['formal_name'])
    addAttribute('gender', user['gender'])
    addAttribute('phone_number', user['phone_number'])
    addAttribute('custom:official_id_type', user['official_id_type'])
    addAttribute('custom:official_id_code', user['official_id_code'])
    addAttribute('custom:official_id_expires', user['official_id_expires'])
    addAttribute('address', user['address'])
    addAttribute('custom:country', user['country'])
    addAttribute('custom:language', user['language'])
    addAttribute('custom:expiry_date', user['expiry_date'])
    addAttribute(
      'custom:created_by',
      event.requestContext.authorizer.claims['sub']
    )
    addAttribute('custom:expiry_date', user['expiry_date'])
    addAttribute('custom:allowed_locations', _.join(newLocations, ' '))

    const imageId = uuidv4() + '.webp'
    addAttribute('custom:official_id_image', imageId)

    try {
      var r = await cognito
        .adminCreateUser({
          UserPoolId: user_pool_id,
          Username: user.username,
          UserAttributes: userAttributes,
          DesiredDeliveryMediums: ['EMAIL'],
        })
        .promise()
    } catch (e) {
      return bad(
        [e, userAttributes, event.requestContext.authorizer],
        'Failed to create user'
      )
    }
    const newUser = r.User

    if (!newUser) return bad(r, 'Failed to create user')
    if (!newUser.Attributes) return bad(r, 'New user missing attributes')

    // Update location groups

    await Promise.all(
      _.map(
        newLocations,
        async l =>
          // NB this would be faster if we checked if the user is already in that group.
          await cognito.adminAddUserToGroup({
            UserPoolId: user_pool_id,
            Username: user.username,
            GroupName: l,
          })
      )
    )

    // We mint an S3 update link for the user image just in case the user wants
    // to upload a replacement image.
    const imageLink = s3.createPresignedPost({
      Bucket: image_bucket_id,
      Fields: {
        key: imageId,
      },
      Conditions: [
        // Images should not be larger than 1MB
        ['content-length-range', 0, 1000000],
        ['eq', '$x-amz-server-side-encryption', 'aws:kms'],
      ],
    })
    imageLink.fields['x-amz-server-side-encryption'] = 'aws:kms'

    if (!findUserAttribute(newUser, 'custom:human_id')) {
      const id = await machineIdToHumanId(
        findUserAttribute(newUser, 'sub'),
        'MU',
        lambda
      )
      await cognito
        .adminUpdateUserAttributes({
          UserPoolId: user_pool_id,
          Username: user.username,
          UserAttributes: [
            {
              Name: 'custom:human_id',
              Value: id.humanID,
            },
          ],
        })
        .promise()
      newUser.Attributes.push({
        Name: 'custom:human_id',
        Value: id.humanID,
      })
    }

    const updatedUser = convertCognitoUser(newUser, image_bucket_id, poolId, s3)

    return good({ user: updatedUser, imageLink })
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
