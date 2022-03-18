import yaml from 'js-yaml'

import { FormType } from 'utils/types/form'
import { formStorage } from './MMKVStorage'
import { getFilesByFormId } from './mockServer'

export async function getFormFiles(
  id: string
): Promise<[FormType | null, Record<string, string>]> {
  let form: FormType | null = null
  let fileCache: Record<string, string>

  if (formStorage.contains(id)) {
    fileCache = JSON.parse(formStorage.getString(id)!) as Record<string, string>
  } else {
    fileCache = await getFilesByFormId(id)
  }

  if ('form.yaml' in fileCache) {
    form = yaml.load(fileCache['form.yaml']) as FormType
  }

  return [form, fileCache]
}
