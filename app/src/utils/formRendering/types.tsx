import _ from 'lodash'
import {
  FormValueType,
  FormPart,
  FormSectionMap,
  FormPartMap,
  FormDefinition,
  FormRef,
  FormConditional,
  FormPartCommon,
  FormPartField,
  FormKVRawType,
  MultipleFormValueTypes,
} from 'utils/formTypes'
import { mapSectionWithPaths, GetValueFn } from 'utils/forms'
import { ArrayElement, NamedFormSection, FormFns } from 'utils/formTypesHelpers'
import { RecordPhoto, RecordPath, RecordDataByType } from 'utils/recordTypes'
import React from 'react'
import { t } from 'i18n-js'
import { resolveRef } from 'utils/forms'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'
import uuid from 'react-native-uuid'

import { Icon, Center, Divider, VStack, Text, Heading } from 'native-base'
import { TextInput, View } from 'react-native'
// @ts-ignore TODO TS doesn't understand .native.tsx and .web.tsx files
import DateTimePicker from 'components/DateTimePicker'
// @ts-ignore typescript doesn't like platform-specific modules
import Signature from 'components/Signature'
import {
  List,
  ListSelectMultiple,
  isPrimitiveType,
} from 'components/form-parts/List'
import ButtonGroup from 'components/form-parts/ButtonGroup'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import Photo from 'components/form-parts/Photo'
import BodyImage from 'components/form-parts/BodyImage'
import CustomButton from 'components/form-parts/Button'

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
        maxW: string | undefined
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
        fullwidth: boolean | undefined
        maxW: string | undefined
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
        fullwidth: boolean | undefined
        maxW: string | undefined
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
        maxW: string | undefined
      }
    | { type: 'phone-number'; value: string; maxW: string | undefined }
    | { type: 'photo'; photos: RecordPhoto[] }
    | {
        type: 'sex'
        value: string
        options: Record<string, string>
        fullwidth: boolean | undefined
        maxW: string | undefined
      }
    | { type: 'signature'; image: URI; date: Date }
    | {
        type: 'text'
        text: string
        placeholder: string | undefined
        maxW: string | undefined
      }
  ) & { valuePath: RecordPath; key: string }
