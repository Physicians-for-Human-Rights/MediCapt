import _ from 'lodash'
import Amplify from 'aws-amplify'
import { API } from 'aws-amplify'
import { LocationType } from 'utils/types/location'
import { UserType } from 'utils/types/user'
import {
  FormMetadata,
  FormManifest,
  FormGetServer,
} from 'utils/types/formMetadata'
import {
  getLocation as managerGetLocation,
  getUserByUsername as managerGetUserByUsername,
  getUserByUUID as managerGetUserByUUID,
} from 'api/manager'
import {
  getLocation as formdesignerGetLocation,
  getUserByUsername as formdesignerGetUserByUsername,
  getUserByUUID as formdesignerGetUserByUUID,
  getForm as formdesignerGetForm,
} from 'api/formdesigner'
import {
  getLocation as providerGetLocation,
  getUserByUsername as providerGetUserByUsername,
  getUserByUUID as providerGetUserByUUID,
  getForm as providerGetForm,
} from 'api/provider'

export async function getUserByUsername(
  poolId: string,
  username: string
): Promise<Partial<UserType | null>> {
  try {
    const fd = await API.endpoint('formdesigner')
    const ma = await API.endpoint('manager')
    const pr = await API.endpoint('provider')
    if (fd) {
      return await formdesignerGetUserByUsername(poolId, username)
    } else if (ma) {
      return await managerGetUserByUsername(poolId, username)
    } else if (pr) {
      return await providerGetUserByUsername(poolId, username)
    } else {
      throw new Error('User type cannot getUser')
    }
  } catch (e) {
    console.error('Failed to get user by ID', e)
    return null
  }
}

export async function getUserByUsernameCached(
  poolId: string,
  username: string,
  notifyDone: (username: string, item: Partial<UserType> | null) => any
): Promise<Partial<UserType> | null> {
  const cached = Amplify.Cache.getItem('USER#' + username)
  if (cached && 'status' in cached && cached.status === 'loaded') {
    notifyDone(username, cached.item)
    return cached.item
  } else if (cached && 'status' in cached && cached.status === 'loading') {
    return null
  } else {
    Amplify.Cache.setItem('USER#' + username, { status: 'loading' })
    const item = await getUserByUsername(poolId, username)
    if (item) {
      Amplify.Cache.setItem('USER#' + username, {
        status: 'loaded',
        item,
      })
    } else {
      Amplify.Cache.removeItem('USER#' + username)
    }
    if (item) notifyDone(username, item)
    return item
  }
}

export async function getUserByUUID(
  poolId: string,
  userUUID: string
): Promise<Partial<UserType | null>> {
  try {
    const fd = await API.endpoint('formdesigner')
    const ma = await API.endpoint('manager')
    const pr = await API.endpoint('provider')
    if (fd) {
      return await formdesignerGetUserByUUID(poolId, userUUID)
    } else if (ma) {
      return await managerGetUserByUUID(poolId, userUUID)
    } else if (pr) {
      return await providerGetUserByUUID(poolId, userUUID)
    } else {
      throw new Error('User type cannot getUser')
    }
  } catch (e) {
    console.error('Failed to get user by UUID', e)
    return null
  }
}

export async function getUserByUUIDCached(
  poolId: string,
  userUUID: string,
  notifyDone: (userUUID: string, item: Partial<UserType> | null) => any
): Promise<Partial<UserType> | null> {
  const cached = Amplify.Cache.getItem('USER#' + userUUID)
  if (cached && 'status' in cached && cached.status === 'loaded') {
    notifyDone(userUUID, cached.item)
    return cached.item
  } else if (cached && 'status' in cached && cached.status === 'loading') {
    return null
  } else {
    Amplify.Cache.setItem('USER#' + userUUID, { status: 'loading' })
    const item = await getUserByUUID(poolId, userUUID)
    if (item) {
      Amplify.Cache.setItem('USER#' + userUUID, {
        status: 'loaded',
        item,
      })
    } else {
      Amplify.Cache.removeItem('USER#' + userUUID)
    }
    if (item) notifyDone(userUUID, item)
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
    if (item && notifyDone) notifyDone(formUUID, item.metadata, item.manifest)
    return item
  }
}
