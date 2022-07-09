import { ImageAnnotation } from 'components/form-parts/BodyImage'
import Photo from 'components/form-parts/Photo'
import _ from 'lodash'
import { ManifestFileWithData } from 'utils/manifests'
import { FormKVRawType, FormPartMap } from 'utils/types/form'
import {
  RecordValuePath,
  RecordValueByType,
  RecordValue,
} from 'utils/types/record'
import { RecordMetadata } from 'utils/types/recordMetadata'
import { Share } from 'utils/types/share'

export type RenderCommand =
  // Commands that correspond to structural UI components
  (
    | {
        type: 'section-heading'
        title: string
      }
    | {
        type: 'title'
        title: string
        size: string
        fontWeight: string
        italic: boolean
        color?: string
        maxW?: string
        originalType?: string
      }
    | {
        type: 'description'
        description: string
      }
    | {
        type: 'divider'
        thickness: number
        w?: string
      }
    | {
        type: 'skip'
        value?: RecordValue
        direction: 'row' | 'column'
      }
    | {
        type: 'remove-repeat-button'
        recordValue?: RecordValueByType['repeat-list']
        title: string
        partRepeated: true | 'at-least-one'
        repeatId: string
      }
    | {
        type: 'add-repeat-button'
        recordValue?: RecordValueByType['repeat-list']
        title: string
        partRepeated: true | 'at-least-one'
      }
    | {
        type: 'padding'
        padding: string
        contents: RenderCommand
      }
    | {
        type: 'row'
        left: RenderCommand
        right: RenderCommand
      }
    | {
        type: 'row-with-description'
        left: RenderCommand
        right: RenderCommand
        description: RenderCommand
      }
    // Commands that correspond to form components
    | {
        type: 'address'
        recordValue?: RecordValueByType['address']
        placeholder?: string
        recordSummary: 'patient-address' | undefined
      }
    | {
        type: 'body-image'
        recordValue?: RecordValueByType['body-image']
        image: string | null
        imageAnnotations: ImageAnnotation[]
      }
    | {
        type: 'bool'
        recordValue?: RecordValueByType['bool']
        fullwidth?: boolean
        maxW?: string
      }
    | {
        type: 'date'
        recordValue?: RecordValueByType['date']
        title: string
        recordSummary: 'incident-date' | 'patient-date-of-birth' | undefined
      }
    | {
        type: 'date-time'
        recordValue?: RecordValueByType['date-time']
        title: string
      }
    | {
        type: 'email'
        recordValue?: RecordValueByType['email']
        placeholder?: string
        recordSummary: 'patient-email' | undefined
      }
    | {
        type: 'gender'
        recordValue?: RecordValueByType['gender']
        options: Record<string, string>
        fullwidth?: boolean
        maxW?: string
        recordSummary: 'patient-gender' | undefined
      }
    | {
        type: 'list'
        recordValue?: RecordValueByType['list']
        options: string[] | boolean[] | number[] | null
        other?: 'text' | 'long-text'
      }
    | {
        type: 'list-with-labels'
        recordValue?: RecordValueByType['list-with-labels']
        options: FormKVRawType[] | null
        other?: 'text' | 'long-text'
      }
    | {
        type: 'list-multiple'
        recordValue?: RecordValueByType['list-multiple']
        options: string[] | boolean[] | number[]
        other?: 'text' | 'long-text'
      }
    | {
        type: 'list-with-labels-multiple'
        recordValue?: RecordValueByType['list-with-labels-multiple']
        options: FormKVRawType[]
        other?: 'text' | 'long-text'
      }
    | {
        type: 'list-with-parts'
        recordValue?: RecordValueByType['list-with-parts']
        options: FormPartMap[]
      }
    | {
        type: 'long-text'
        recordValue?: RecordValueByType['long-text']
        numberOfLines: number
        placeholder?: string
      }
    | {
        type: 'number'
        recordValue?: RecordValueByType['number']
        placeholder?: string
        maxW?: string
      }
    | {
        type: 'phone-number'
        recordValue?: RecordValueByType['phone-number']
        maxW?: string
        recordSummary: 'patient-phone-number' | undefined
      }
    | {
        type: 'photo'
        recordValue?: RecordValueByType['photo']
        photos: Photo[]
      }
    | {
        type: 'sex'
        recordValue?: RecordValueByType['sex']
        options: Record<string, string>
        fullwidth?: boolean
        maxW?: string
      }
    | {
        type: 'signature'
        recordValue?: RecordValueByType['signature']
        imageUri?: string
      }
    | {
        type: 'text'
        recordValue?: RecordValueByType['text']
        placeholder?: string
        maxW?: string
        color?: string
        recordSummary: 'patient-name' | undefined
      }
    | {
        type: 'record-list'
        list: RecordMetadata[]
        select: (r: RecordMetadata) => any
      }
    | {
        type: 'share-list'
        list: Share[]
        select: (r: Share) => any
      }
  ) & { valuePath: RecordValuePath; key: string; disable: boolean }
