import { readFile } from 'utils/forms'
import { map } from 'lodash'

export const rawFiles: Record<string, string> = {
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

export async function getFormById(_: string) {
  const formName = 'form.yaml'
  const uri = rawFiles[formName]
  const data = (await readFile(formName, uri))!

  console.log('Server request getFormById')
  return data
}

export async function getFormImageById(formId: string, imageId: string) {
  const uri: string | undefined = rawFiles[imageId]
  const data = uri ? await readFile(imageId, uri) : null

  if (!data) {
    throw new Error(
      `Fetching nonexistent image /form/${formId}/image/${imageId} from server.`
    )
  }

  console.log(`Server request getFormImageById(${formId}, ${imageId})`)
  return data
}
