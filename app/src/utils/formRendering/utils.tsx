import _ from 'lodash'
import { RenderCommand } from 'utils/formRendering/types'
import { FormPart } from 'utils/types/form'
import { RecordValueByType } from 'utils/types/record'
import {
  ManifestFileWithData,
  lookupContentsByNameAndType,
  lookupContentsSHA256,
} from 'utils/manifests'

export function disabled(
  command: RenderCommand,
  whenDisabled: string,
  whenEnabled: string | undefined = undefined
) {
  if (command.disable) return whenDisabled
  return whenEnabled
}

export const disabledBackground = 'coolGray.50'

export function disableRenderCommand(c: RenderCommand): RenderCommand {
  c.disable = true
  if (c.type === 'padding') disableRenderCommand(c.contents)
  if (c.type === 'row') {
    disableRenderCommand(c.left)
    disableRenderCommand(c.right)
  }
  if (c.type === 'row-with-description') {
    disableRenderCommand(c.left)
    disableRenderCommand(c.right)
    disableRenderCommand(c.description)
  }
  return c
}

export function disableRenderCommands(c: RenderCommand[]): RenderCommand[] {
  return _.map(c, disableRenderCommand)
}

export function bodyImage(
  part: FormPart & { type: 'body-image' },
  recordValue: RecordValueByType['body-image'] | undefined,
  contents: ManifestFileWithData[],
  genderOrSex: string
) {
  return (
    (recordValue &&
      lookupContentsSHA256(contents, recordValue?.value.imageHash)) ||
    ('filename-female' in part &&
      part['filename-female'] &&
      genderOrSex === 'female' &&
      lookupContentsByNameAndType(
        contents,
        part['filename-female'],
        'image/'
      )) ||
    ('filename-inteserx' in part &&
      part['filename-intersex'] &&
      genderOrSex === 'intersex' &&
      lookupContentsByNameAndType(
        contents,
        part['filename-intersex'],
        'image/'
      )) ||
    ('filename-transgender' in part &&
      part['filename-transgender'] &&
      genderOrSex === 'transgender' &&
      lookupContentsByNameAndType(
        contents,
        part['filename-transgender'],
        'image/'
      )) ||
    ('filename-male' in part &&
      part['filename-male'] &&
      genderOrSex === 'male' &&
      lookupContentsByNameAndType(contents, part['filename-male'], 'image/')) ||
    ('filename' in part &&
      part.filename &&
      lookupContentsByNameAndType(contents, part['filename'], 'image/')) ||
    null
  )
}
