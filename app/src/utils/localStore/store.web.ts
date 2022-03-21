import yaml from 'js-yaml'

import { FormType } from 'utils/types/form'
import { rawFiles, getFormById, getFormImageById } from './mockServer'

export async function getForm(formId: string): Promise<FormType> {
  const form = await getFormById(formId)
  return yaml.load(form) as FormType
}

export async function getFormFiles(form: FormType) {
  let fileCache: Record<string, string> = {}

  for (const imageId of getImageIdsInForm(form)) {
    const data = await getFormImageById(form.uuid, imageId)
    fileCache[imageId] = data
  }

  return fileCache
}

function getImageIdsInForm(form: FormType) {
  // TODO
  return Object.keys(rawFiles)
}
