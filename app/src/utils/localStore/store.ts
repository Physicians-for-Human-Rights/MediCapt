import { formStorage } from 'utils/localStore/MMKVStorage'
import { FormType } from 'utils/types/form'
import yaml from 'js-yaml'
import { getFilesByFormId } from 'utils/localStore/mockServer'

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
