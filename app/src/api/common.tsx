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
  FormGetServer,
} from 'utils/types/formMetadata'
import { QueryFilterForType } from 'utils/types/url'
import {
  getLocation as managerGetLocation,
  getUser as managerGetUser,
} from 'api/manager'
import {
  getLocation as formdesignerGetLocation,
  getUser as formdesignerGetUser,
  getForm as formdesignerGetForm,
} from 'api/formdesigner'
import {
  getLocation as providerGetLocation,
  getUser as providerGetUser,
  getForm as providerGetForm,
} from 'api/provider'

export async function getUser(
  poolId: string,
  username: string
): Promise<Partial<UserType | null>> {
  try {
    const fd = await API.endpoint('formdesigner')
    const ma = await API.endpoint('manager')
    const pr = await API.endpoint('provider')
    if (fd) {
      return await formdesignerGetUser(poolId, username)
    } else if (ma) {
      return await managerGetUser(poolId, username)
    } else if (pr) {
      return await providerGetUser(poolId, username)
    } else {
      throw new Error('User type cannot getUser')
    }
  } catch (e) {
    return null
  }
}

export async function getUserCached(
  poolId: string,
  userUUID: string,
  notifyDone: (userUUID: string, item: UserType | null) => any
): Promise<Partial<UserType> | null> {
  const cached = Amplify.Cache.getItem('USER#' + userUUID)
  if (cached && 'status' in cached && cached.status === 'loaded') {
    notifyDone(userUUID, cached.item)
    return cached.item
  } else if (cached && 'status' in cached && cached.status === 'loading') {
    return null
  } else {
    Amplify.Cache.setItem('USER#' + userUUID, { status: 'loading' })
    const item = await getUser(poolId, userUUID)
    if (item) {
      Amplify.Cache.setItem('USER#' + userUUID, {
        status: 'loaded',
        item,
      })
    } else {
      Amplify.Cache.removeItem('USER#' + userUUID)
    }
    notifyDone(
      userUUID,
      // @ts-ignore TODO What's up here?
      item
    )
    return item
  }
}

export async function getLocation(
  locationUUID: string
): Promise<LocationType | null> {
  try {
    const fd = await API.endpoint('formdesigner')
    const ma = await API.endpoint('manager')
    const pr = await API.endpoint('provider')
    if (fd) {
      return await formdesignerGetLocation(locationUUID)
    } else if (ma) {
      return await managerGetLocation(locationUUID)
    } else if (pr) {
      return await providerGetLocation(locationUUID)
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

export async function getForm(formUUID: string): Promise<FormGetServer | null> {
  try {
    const fd = await API.endpoint('formdesigner')
    const pr = await API.endpoint('provider')
    if (fd) {
      return await formdesignerGetForm(formUUID)
    } else if (pr) {
      return await providerGetForm(formUUID)
    } else {
      throw new Error('User type cannot getForm')
    }
  } catch (e) {
    return null
  }
}

export async function getFormCached(
  formUUID: string,
  notifyDone?: (
    formUUID: string,
    metadata: FormMetadata,
    manifest: FormManifest
  ) => any
): Promise<FormGetServer | null> {
  const cached = Amplify.Cache.getItem('FORM#' + formUUID)
  if (cached && 'status' in cached && cached.status === 'loaded') {
    if (notifyDone)
      notifyDone(formUUID, cached.item.metadata, cached.item.manifest)
    return cached.item
  } else if (cached && 'status' in cached && cached.status === 'loading') {
    return null
  } else {
    Amplify.Cache.setItem('FORM#' + formUUID, { status: 'loading' })
    const item = await getForm(formUUID)
    if (item) {
      Amplify.Cache.setItem('FORM#' + formUUID, {
        status: 'loaded',
        item,
      })
    } else {
      Amplify.Cache.removeItem('FORM#' + formUUID)
    }
    if (notifyDone)
      notifyDone(formUUID, cached.item.metadata, cached.item.manifest)
    return item
  }
}
