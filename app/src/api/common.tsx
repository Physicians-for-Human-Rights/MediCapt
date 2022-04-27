import _ from 'lodash'
import Amplify from 'aws-amplify'
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
import { FormType } from 'utils/types/form'
import {
  formMetadataSchemaByUser,
  formMetadataSchema,
  formManifestSchema,
  formManifestWithLinksSchema,
  FormMetadataByUser,
  FormMetadata,
  FormManifest,
  FormManifestWithLinks,
  FormFromServer,
} from 'utils/types/formMetadata'
import { QueryFilterForType } from 'utils/types/url'
import {
  getLocation as managerGetLocation,
  getUser as managerGetUser,
} from 'api/manager'
import {
  getLocation as formdesignerGetLocation,
  getUser as formdesignerGetUser,
} from 'api/formdesigner'

export async function getUser(
  poolId: string,
  username: string
): Promise<Partial<UserType | null>> {
  try {
    const fd = await API.endpoint('formdesigner')
    const ma = await API.endpoint('manager')
    if (fd) {
      return await formdesignerGetUser(poolId, username)
    } else if (ma) {
      return await managerGetUser(poolId, username)
    } else {
      throw new Error('User type cannot getLocation')
    }
  } catch (e) {
    return null
  }
}

export async function getLocation(
  locationUUID: string
): Promise<LocationType | null> {
  try {
    const fd = await API.endpoint('formdesigner')
    const ma = await API.endpoint('manager')
    if (fd) {
      return await formdesignerGetLocation(locationUUID)
    } else if (ma) {
      return await managerGetLocation(locationUUID)
    } else {
      throw new Error('User type cannot getLocation')
    }
  } catch (e) {
    return null
  }
}

export async function getLocationCached(
  locationUUID: string,
  notifyDone: (locationUUID: string, item: LocationType | null) => any
): Promise<LocationType | null> {
  const cached = Amplify.Cache.getItem('LOCATION#' + locationUUID)
  if (cached && 'status' in cached && cached.status === 'loaded') {
    notifyDone(locationUUID, cached.item)
    return cached.item
  } else if (cached && 'status' in cached && cached.status === 'loading') {
    return null
  } else {
    Amplify.Cache.setItem('LOCATION#' + locationUUID, { status: 'loading' })
    const item = await getLocation(locationUUID)
    if (item) {
      Amplify.Cache.setItem('LOCATION#' + locationUUID, {
        status: 'loaded',
        item,
      })
    } else {
      Amplify.Cache.removeItem('LOCATION#' + locationUUID)
    }
    notifyDone(locationUUID, item)
    return item
  }
}
