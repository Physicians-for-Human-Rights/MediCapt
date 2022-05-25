import yaml from 'js-yaml'

import { FormType } from 'utils/types/form'
import { formStorage } from './MMKVStorage'
import { getFormById, getFormImageById } from './mockServer'

export async function getForm(formId: string): Promise<FormType> {
  const formPath = `/form/${formId}`
  let form: string

  if (formStorage.contains(formPath)) {
    form = formStorage.getString(formPath)!
  } else {
    form = await getFormById(formId)
    formStorage.set(formPath, form)
  }

  return yaml.load(form) as FormType
}

export async function getFormFiles(formId: string, imageIds: string[]) {
  let fileCache: Record<string, string> = {}

  for (const imageId of imageIds) {
    const imagePath = `/form/${formId}/image/${imageId}`

    if (formStorage.contains(imagePath)) {
      fileCache[imageId] = formStorage.getString(imagePath)!
    } else {
      const data = await getFormImageById(formId, imageId)
      formStorage.set(imagePath, data)
      fileCache[imageId] = data
    }
  }

  return fileCache
}
