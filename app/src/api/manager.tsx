import _ from 'lodash'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  Feather,
  MaterialIcons,
} from '@expo/vector-icons'
import { API } from 'aws-amplify'
import {
  LocationType,
  locationSchema,
  LocationByUserType,
  locationSchemaByUser,
} from 'utils/types/location'
import {
  UserType,
  userSchema,
  UserByUserType,
  userSchemaByUser,
} from 'utils/types/user'
import { QueryFilterForType } from 'utils/types/url'
import { schemaVersions } from 'api/utils'

// User

export async function createUser(user: UserByUserType) {
  userSchemaByUser.parse(user)
  schemaVersions(userSchema)
  const data = await API.post('manager', '/manager/user', {
    body: user,
    headers: {
      AcceptedVersions: JSON.stringify({
        user: schemaVersions(userSchema),
      }),
    },
  })
  return {
    user: userSchema.parse(data.user),
    imageLink: data.imageLink,
  }
}

export async function getUserByUsername(
  poolId: string,
  username: string
): Promise<Partial<UserType>> {
  const data = await API.get(
    'manager',
    '/manager/user/byId/' + poolId + '/' + username,
    {
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(userSchema)),
      },
    }
  )
  return userSchema.partial().parse(data)
}

export async function getUserByUUID(
  poolId: string,
  uuid: string
): Promise<Partial<UserType>> {
  const data = await API.get(
    'manager',
    '/manager/user/byId/' + poolId + '/' + uuid,
    {
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(userSchema)),
      },
    }
  )
  return userSchema.partial().parse(data)
}

export async function updateUser(user: UserType) {
  userSchemaByUser.parse(user)
  const data = await API.post(
    'manager',
    '/manager/user/byId/' + user.userType + '/' + user.username,
    {
      body: user,
      headers: {
        AcceptedVersions: JSON.stringify({
          user: schemaVersions(userSchema),
        }),
      },
    }
  )
  return {
    user: userSchema.parse(data.user),
    imageLink: data.imageLink,
  }
}

export async function resetUserPassword(user: UserType) {
  userSchemaByUser.parse(user)
  await API.post(
    'manager',
    '/manager/user/byId/' +
      user.userType +
      '/' +
      user.username +
      '/resetPassword',
    {
      body: user,
      headers: {
        AcceptedVersions: JSON.stringify({
          user: schemaVersions(userSchema),
        }),
      },
    }
  )
}

export async function confirmUserEmail(user: UserType) {
  userSchemaByUser.parse(user)
  await API.post(
    'manager',
    '/manager/user/byId/' +
      user.userType +
      '/' +
      user.username +
      '/confirmEmail',
    {
      body: user,
      headers: {
        AcceptedVersions: JSON.stringify({
          user: schemaVersions(userSchema),
        }),
      },
    }
  )
}

export async function resendUserConfirmationEmail(user: UserType) {
  userSchemaByUser.parse(user)
  await API.post(
    'manager',
    '/manager/user/byId/' +
      user.userType +
      '/' +
      user.username +
      '/resendConfirmationEmail',
    {
      body: user,
      headers: {
        AcceptedVersions: JSON.stringify({
          user: schemaVersions(userSchema),
        }),
      },
    }
  )
}

export async function findUsers(
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
) {
  try {
    pre()
    let filters: QueryFilterForType<UserType & Record<string, string>> = []
    if (filterEnabledOrDisabled)
      filters.push({ status: { eq: filterEnabledOrDisabled } })
    if (filterLocation)
      filters.push({ allowed_locations: { eq: filterLocation } })
    if (filterSearchType && filterText)
      filters.push({ [filterSearchType]: { contains: filterText } })
    const data = await API.get('manager', '/manager/user', {
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

// Location

export async function createLocation(location: LocationByUserType) {
  locationSchemaByUser.parse(location)
  const data = await API.post('manager', '/manager/location', {
    body: location,
    headers: {
      AcceptedVersions: JSON.stringify(schemaVersions(locationSchema)),
    },
  })
  return locationSchema.parse(data)
}

export async function getLocation(locationUUID: string) {
  const data = await API.get(
    'manager',
    '/manager/location/byId/' + locationUUID,
    {
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(locationSchema)),
      },
    }
  )
  return locationSchema.parse(data)
}

export async function updateLocation(location: LocationType) {
  locationSchema.parse(location)
  const data = await API.post(
    'manager',
    '/manager/location/byId/' + location.locationUUID,
    {
      body: location,
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(locationSchema)),
      },
    }
  )
  return locationSchema.parse(data)
}

export async function deleteLocation(location: LocationType) {
  locationSchema.parse(location)
  const data = await API.del(
    'manager',
    '/manager/location/byId/' + location.locationUUID,
    {
      body: location,
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(locationSchema)),
      },
    }
  )
  return null
}

export async function findLocations(
  pre: () => any,
  post: () => any,
  filterCountry: string | undefined,
  filterLanguage: string | undefined,
  filterEntityType: string | undefined,
  filterText: string | undefined,
  handleErrors: (err: any) => any,
  setLocations: (users: LocationType[]) => any,
  setNextKey: (key: string) => any
) {
  try {
    pre()
    let filters: QueryFilterForType<LocationType> = []
    if (filterCountry) filters.push({ country: { eq: filterCountry } })
    if (filterLanguage) filters.push({ language: { eq: filterLanguage } })
    if (filterEntityType) filters.push({ entityType: { eq: filterEntityType } })
    if (filterText) filters.push({ locationID: { eq: filterText } })
    const data = await API.get('manager', '/manager/location', {
      queryStringParameters: {
        filter: JSON.stringify(filters),
      },
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(locationSchema)),
      },
    })
    // @ts-ignore If this fails, the server gave us bad data
    setLocations(_.map(data.items, locationSchema.parse))
    setNextKey(data.nextKey)
  } catch (e) {
    handleErrors(e)
  } finally {
    post()
  }
}
