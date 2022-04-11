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

export async function createLocation(location: LocationByUserType) {
  locationSchemaByUser.parse(location)
  const data = await API.post('manager', '/manager/location', {
    body: location,
  })
  return locationSchema.parse(data)
}

export async function getLocation(locationUUID: string) {
  const data = await API.get(
    'manager',
    '/manager/location/byId/' + locationUUID,
    {}
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
    }
  )
  return null
}
