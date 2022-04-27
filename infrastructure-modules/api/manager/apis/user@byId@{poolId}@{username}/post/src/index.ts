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
      humanid_lambda: string
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
    try {
      var user = userSchemaByUser.parse(JSON.parse(event.body!)) as UserType
    } catch (e) {
      return bad(e, 'Bad input user')
    }

    const existingUser = await cognito
      .adminGetUser({
        UserPoolId: user_pool_id,
        Username: username,
      })
      .promise()

    let userAttributes: AWS.CognitoIdentityServiceProvider.AttributeListType = []
    if (!existingUser.UserAttributes)
      return bad(existingUser, 'No user attributes')

    if (user.userType !== poolId)
      return bad([user.userType, poolId], 'You cannot change the user type')

    // Add the attribute to the update list if it isn't equal
    function addAttributeIfDifferent(name: string, val: any) {
      const x = _.find(existingUser.UserAttributes, a => a.Name === name)
      if (x && x.Value && val === x.Value) return null
      userAttributes.push({
        Name: name,
        Value: _.isDate(val) ? val.toISOString() : val,
      })
    }

    // Determine which locations must be updated and if the caller is allowed to
    // do so

    const oldLocations = splitLocations(
      findUserAttribute(existingUser, 'custom:allowed_locations')
    )
    const newLocations = splitLocations(user.allowed_locations)

    const toRemoveLocations = _.difference(oldLocations, newLocations)
    const toAddLocations = _.difference(newLocations, oldLocations)

    const callerLocations = splitLocations(
      event.requestContext.authorizer.claims['custom:allowed_locations']
    )
    if (
      !_.isEqual(callerLocations, ['admin']) &&
      !_.isEqual(
        _.difference(
          _.union(toRemoveLocations, toAddLocations),
          callerLocations
        ),
        []
      )
    ) {
      return bad(
        [
          _.difference(
            _.union(toRemoveLocations, toAddLocations),
            callerLocations
          ),
          callerLocations,
          event.requestContext.authorizer,
          toRemoveLocations,
          toAddLocations,
        ],
        'You are not allowed to add/remove users from this location'
      )
    }

    // Determine which attributes we are updating

    addAttributeIfDifferent('custom:storage_version', user['storage-version'])
    // NB username cannot be updated
    addAttributeIfDifferent('email', user['email'])
    addAttributeIfDifferent('birthdate', user['birthdate'])
    addAttributeIfDifferent('name', user['name'])
    addAttributeIfDifferent('nickname', user['nickname'])
    addAttributeIfDifferent('custom:formal_name', user['formal_name'])
    addAttributeIfDifferent('gender', user['gender'])
    addAttributeIfDifferent('phone_number', user['phone_number'])
    addAttributeIfDifferent('custom:official_id_type', user['official_id_type'])
    addAttributeIfDifferent('custom:official_id_code', user['official_id_code'])
    addAttributeIfDifferent(
      'custom:official_id_expires',
      user['official_id_expires']
    )
    addAttributeIfDifferent('address', user['address'])
    addAttributeIfDifferent('custom:country', user['country'])
    addAttributeIfDifferent('custom:language', user['language'])
    addAttributeIfDifferent('custom:expiry_date', user['expiry_date'])
    // NB created_by cannot be updated
    // NB user_type cannot be updated

    if (!findUserAttribute(existingUser, 'custom:created_by')) {
      addAttributeIfDifferent('custom:created_by', 'unknown')
    }

    if (newLocations)
      userAttributes.push({
        Name: 'custom:allowed_locations',
        Value: _.join(newLocations, ' '),
      })

    const sub = findUserAttribute(existingUser, 'sub')
    if (!sub) return bad(existingUser, 'User missing sub attribute')
    if (!findUserAttribute(existingUser, 'custom:human_id')) {
      const id = await machineIdToHumanId(
        sub,
        'MU',
        lambda,
        process.env.humanid_lambda
      )
      userAttributes.push({
        Name: 'custom:human_id',
        Value: id.humanID,
      })
    }

    let imageId = findUserAttribute(existingUser, 'custom:official_id_image')
    if (!imageId) {
      imageId = sub + '.webp'
      userAttributes.push({
        Name: 'custom:official_id_image',
        Value: sub + '.webp',
      })
    }

    // Update attributes
    if (userAttributes)
      await cognito
        .adminUpdateUserAttributes({
          UserPoolId: user_pool_id,
          Username: username,
          UserAttributes: userAttributes,
        })
        .promise()

    // Update location groups

    await Promise.all(
      _.map(
        toAddLocations,
        async l =>
          // NB this would be faster if we checked if the user is already in that group.
          await cognito.adminAddUserToGroup({
            UserPoolId: user_pool_id,
            Username: username,
            GroupName: l,
          })
      )
    )
    await Promise.all(
      _.map(
        toRemoveLocations,
        async l =>
          // NB this would be faster if we checked if the user is already in that group.
          await cognito.adminRemoveUserFromGroup({
            UserPoolId: user_pool_id,
            Username: username,
            GroupName: l,
          })
      )
    )

    // Update user status & enable/disable

    if (existingUser.UserStatus !== user.status) {
      if (
        user.status === 'RESET_REQUIRED' ||
        user.status === 'FORCE_CHANGE_PASSWORD'
      ) {
        await cognito
          .adminResetUserPassword({
            UserPoolId: user_pool_id,
            Username: username,
          })
          .promise()
      } else if (
        existingUser.UserStatus === 'UNCONFIRMED' &&
        user.status === 'CONFIRMED'
      ) {
        await cognito
          .adminConfirmSignUp({ UserPoolId: user_pool_id, Username: username })
          .promise()
      } else {
        return bad(
          { from: existingUser.UserStatus, to: user.status },
          'User status change invalid'
        )
      }
    }

    if (existingUser.Enabled !== user.enabled) {
      if (user.enabled) {
        await cognito
          .adminEnableUser({ UserPoolId: user_pool_id, Username: username })
          .promise()
      } else {
        await cognito
          .adminDisableUser({ UserPoolId: user_pool_id, Username: username })
          .promise()
      }
    }

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

    const updatedUser = convertCognitoUser(
      await cognito
        .adminGetUser({
          UserPoolId: user_pool_id,
          Username: username,
        })
        .promise(),
      image_bucket_id,
      poolId,
      s3
    )

    return good({ user: updatedUser, imageLink, image_bucket_id })
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
