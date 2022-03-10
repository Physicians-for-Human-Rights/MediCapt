import _ from 'lodash'
import { FormKVRawType } from 'utils/types/form'
import { RecordPhoto, RecordPath, RecordDataByType } from 'utils/types/record'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'
import {
  List,
  ListSelectMultiple,
  isPrimitiveType,
} from 'components/form-parts/List'

export type URI = string

export type RenderCommand =
  // Commands that correspond to structural UI components
  (
    | {
        type: 'title'
        title: string
        size: string
        fontWeight: string
        italic: boolean
        maxW?: string | undefined
      }
    | {
        type: 'description'
        description: string
      }
    | {
        type: 'divider'
        thickness: number
        w: string | undefined
      }
    | {
        type: 'skip'
        skipped: boolean
        skippedPath: RecordPath
        direction: 'row' | 'column'
      }
    | {
        type: 'remove-repeat-button'
        title: string
        repeatId: string
        repeatList: string[]
        repeatListPath: RecordPath
      }
    | {
        type: 'add-repeat-button'
        title: string
        repeatList: string[]
        repeatListPath: RecordPath
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
        text: string | undefined
        placeholder: string | undefined
      }
    | {
        type: 'body-image'
        backgroundImage: URI
        annotations: RecordDataByType['body-image']['annotations']
        annotationPath: RecordPath
      }
    | {
        type: 'bool'
        selected: boolean | null
        fullwidth?: boolean | undefined
        maxW?: string | undefined
      }
    | { type: 'date'; date: Date; title: string }
    | { type: 'date-time'; date: Date; title: string }
    | {
        type: 'email'
        text: string | undefined
        placeholder: string | undefined
      }
    | {
        type: 'gender'
        selected: string
        options: Record<string, string>
        fullwidth?: boolean | undefined
        maxW?: string | undefined
      }
    | {
        type: 'list'
        value: string
        options: string[] | boolean[] | number[] | null
        other: 'text' | 'long-text' | undefined
        otherValue: string | null
        otherPath: RecordPath
      }
    | {
        type: 'list-multiple'
        values: boolean[]
        valuePaths: RecordPath[]
        otherChecked: boolean | null
        otherText: string | undefined
        otherPath: RecordPath
        otherPathText: RecordPath
        other: 'text' | 'long-text' | undefined
        options: string[] | boolean[] | number[]
      }
    | {
        type: 'list-with-labels'
        options: FormKVRawType[] | null
        value: string | null
        other: 'text' | 'long-text' | undefined
        otherValue: string | null
        otherPath: RecordPath
      }
    | {
        type: 'list-with-labels-multiple'
        options: FormKVRawType[]
        value: any[]
        valuePaths: RecordPath[]
        other: 'text' | 'long-text' | undefined
        otherValue: string | null
      }
    | {
        type: 'list-with-parts'
        // TODO list-with-parts
      }
    | {
        type: 'long-text'
        text: string
        numberOfLines: number
        placeholder: string | undefined
      }
    | {
        type: 'number'
        value: string
        placeholder: string | undefined
        maxW?: string | undefined
      }
    | { type: 'phone-number'; value: string; maxW?: string | undefined }
    | { type: 'photo'; photos: RecordPhoto[] }
    | {
        type: 'sex'
        value: string
        options: Record<string, string>
        fullwidth?: boolean | undefined
        maxW?: string | undefined
      }
    | { type: 'signature'; image: URI; date: Date }
    | {
        type: 'text'
        text: string
        placeholder: string | undefined
        maxW: string | undefined
      }
  ) & { valuePath: RecordPath; key: string; disable: boolean }
