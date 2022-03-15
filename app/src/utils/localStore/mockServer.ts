import { readFile } from 'utils/forms'
import yaml from 'js-yaml'
import { FormType } from 'utils/types/form'
import { map } from 'lodash'

const rawFiles: Record<string, string> = {
  'form.yaml':
    require('../../../assets/forms/ke-moh-363-2019/form.yaml') as string,
  'form.pdf':
    require('../../../assets/forms/ke-moh-363-2019/form.pdf') as string,
  'anterior.png':
    require('../../../assets/forms/ke-moh-363-2019/anterior.png') as string,
  'bottom.png':
    require('../../../assets/forms/ke-moh-363-2019/bottom.png') as string,
  'female-1.png':
    require('../../../assets/forms/ke-moh-363-2019/female-1.png') as string,
  'female-2.png':
    require('../../../assets/forms/ke-moh-363-2019/female-2.png') as string,
  'female-3.png':
    require('../../../assets/forms/ke-moh-363-2019/female-3.png') as string,
  'male-1.png':
    require('../../../assets/forms/ke-moh-363-2019/male-1.png') as string,
  'male-2.png':
    require('../../../assets/forms/ke-moh-363-2019/male-2.png') as string,
  'posterior.png':
    require('../../../assets/forms/ke-moh-363-2019/posterior.png') as string,
  'male-3.png':
    require('../../../assets/forms/ke-moh-363-2019/male-3.png') as string,
  'top.png': require('../../../assets/forms/ke-moh-363-2019/top.png') as string,
}

export async function getFilesByFormId(_: string) {
  const fileCache: Record<string, string> = {}

  await map(rawFiles, async (uri, filename) => {
    const data = await readFile(filename, uri)
    if (data) {
      fileCache[filename] = data
    }
  })

  return fileCache
}
