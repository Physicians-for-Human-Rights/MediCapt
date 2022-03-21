import yaml from 'js-yaml'

import { FormType } from 'utils/types/form'
import { formStorage } from './MMKVStorage'
import { rawFiles, getFormById, getFormImageById } from './mockServer'

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

export async function getFormFiles(form: FormType) {
  let fileCache: Record<string, string> = {}

  // await Promise.all(
  //   map(getImageIdsInForm(form), async imageId => {
  for (const imageId of getImageIdsInForm(form)) {
    const imagePath = `/form/${form.uuid}/image/${imageId}`

    if (formStorage.contains(imagePath)) {
      fileCache[imageId] = formStorage.getString(imagePath)!
    } else {
      const data = await getFormImageById(form.uuid, imageId)
      formStorage.set(imagePath, data)
      fileCache[imageId] = data
    }
  }
  // )

  return fileCache
}

function getImageIdsInForm(form: FormType) {
  // TODO
  return Object.keys(rawFiles)
}
