import React, { useState } from 'react'
import { t } from 'i18n-js'
import _ from 'lodash'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  Feather,
  MaterialIcons,
} from '@expo/vector-icons'
import { handleStandardErrors } from 'utils/errors'
import { UserType, userSchema } from 'utils/types/user'
import { QueryFilterForType } from 'utils/types/url'
import { API } from 'aws-amplify'

export type StandardReporters = {
  setWaiting: (s: string | null) => any
  error: any
  warning: any
  success: any
}

export async function standardHandler<T>(
  { setWaiting, error, warning, success }: StandardReporters,
  preMsg: string,
  postMsg: string,
  apiCallFn: () => T
): Promise<T | null> {
  try {
    setWaiting(preMsg)
    const r = await apiCallFn()
    postMsg && success(postMsg)
    return r
  } catch (e) {
    handleStandardErrors(error, warning, success, e)
  } finally {
    setWaiting(null)
  }
  return null
}

export function schemaVersions(schema: any) {
  if (
    schema.shape &&
    schema.shape['storage-version'] &&
    schema.shape['storage-version'].value
  )
    return [schema.shape['storage-version'].value]

  if (
    schema._def &&
    schema._def.typeName === 'ZodDiscriminatedUnion' &&
    schema._def.discriminator === 'storage-version'
  ) {
    return Array.from(schema._def.options.keys())
  }
  console.error('BUG cannot determine this schema version', schema)
  throw 'BUG Cannot determine schema version'
}

export function findUsersWrapper(userPrefix: string) {
  return async (
    pre: () => any,
    post: () => any,
    filterEnabledOrDisabled: string | undefined,
    filterLocation: string | undefined,
    filterSearchType: string | undefined,
    filterText: string | undefined,
    filterUserType: string | undefined,
    handleErrors: (err: any) => any,
    setUsers: (users: UserType[]) => any,
    setNextKey: (key: string) => any
  ) => {
    try {
      pre()
      let filters: QueryFilterForType<UserType & Record<string, string>> = []
      if (filterEnabledOrDisabled)
        filters.push({ status: { eq: filterEnabledOrDisabled } })
      if (filterLocation)
        filters.push({ allowed_locations: { eq: filterLocation } })
      if (filterSearchType && filterText)
        filters.push({ [filterSearchType]: { contains: filterText } })
      const data = await API.get(userPrefix, '/' + userPrefix + '/user', {
        queryStringParameters: {
          userType: JSON.stringify(filterUserType),
          filter: JSON.stringify(filters),
        },
        headers: {
          AcceptedVersions: JSON.stringify(schemaVersions(userSchema)),
        },
      })
      // @ts-ignore TODO
      setUsers(_.map(data.items, userSchema.partial().parse))
      setNextKey(data.nextKey)
    } catch (e) {
      handleErrors(e)
    } finally {
      post()
    }
  }
}
