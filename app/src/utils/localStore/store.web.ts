import yaml from 'js-yaml'

import { FormMetadata, FormType } from 'utils/types/form'
import { RecordMetadata, RecordType } from 'utils/types/record'
import {
  getFormById,
  getFormImageById,
  getFormByCountry,
  getRecordByUser,
  getRecordById,
  getRecordImageById,
} from './mockServer'

export async function getCountryForms(country: string, localOnly?: boolean) {
  if (localOnly) {
    return []
  }
  const forms = await getFormByCountry(country)
  return forms as FormMetadata[]
}

export async function getForm(formId: string): Promise<FormType>
export async function getForm(
  formId: string,
  localOnly: boolean
): Promise<FormType | null>

export async function getForm(formId: string, localOnly?: boolean) {
  if (localOnly) {
    return null
  }
  const form = await getFormById(formId)
  return yaml.load(form) as FormType
}

export async function getFormImages(
  formId: string,
  imageIds: string[],
  localOnly?: boolean
) {
  let imageCache: Record<string, string> = {}

  if (localOnly) {
    return imageCache
  }

  for (const imageId of imageIds) {
    const data = await getFormImageById(formId, imageId)
    imageCache[imageId] = data
  }

  return imageCache
}

export async function getUserRecords(localOnly?: boolean) {
  if (localOnly) {
    return []
  }
  const records = await getRecordByUser()
  return records as RecordMetadata[]
}

export async function getRecord(recordId: string): Promise<RecordType>
export async function getRecord(
  recordId: string,
  localOnly: boolean
): Promise<RecordType | null>

export async function getRecord(recordId: string, localOnly?: boolean) {
  if (localOnly) {
    return null
  }
  const record = await getRecordById(recordId)
  return record
}

export async function putRecord(
  formId: string,
  localOnly?: boolean
): Promise<RecordType | null> {
  if (localOnly) {
    throw Error("Can't store records locally on the browser.")
  }
  // create RecordType
  // put in local storage and add to localMetadata and to upload queue
  // put images in local storage
  // upload to server
  // if succesful {
  //   remove from upload queue, local metadata, and replace local sotrage and recordMetadata
  //   add images to upload queue
  //   upload images
  // }
  // return RecordType
  return null
}

// export async function removeRecord

export async function getRecordImages(
  recordId: string,
  imageIds: string[],
  localOnly?: boolean
) {
  let imageCache: Record<string, string> = {}

  if (localOnly) {
    return imageCache
  }

  for (const imageId of imageIds) {
    const data = await getRecordImageById(recordId, imageId)
    imageCache[imageId] = data
  }

  return imageCache
}
