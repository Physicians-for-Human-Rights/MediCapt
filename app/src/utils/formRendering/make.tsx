import _ from 'lodash'
import {
  RecordValue,
  RecordValuePath,
  recordValueSchema,
  RecordType,
  FlatRecord,
} from 'utils/types/record'

export function mkTitle(title: string, key: string, color?: string) {
  return [
    {
      type: 'title',
      title,
      size: 'md',
      valuePath: [],
      key: key + 1,
      disable: false,
      recordValue: { type: 'text', value: '' },
      recordSummary: undefined,
      color,
    },
  ]
}

export function mkText(
  title: string,
  text: string,
  key: string,
  color?: string
) {
  return [
    {
      type: 'title',
      title,
      size: 'sm',
      valuePath: [],
      key: key + 1,
      disable: false,
      recordValue: { type: 'text', value: '' },
      recordSummary: undefined,
      color,
    },
    {
      type: 'text',
      valuePath: [],
      key: key + 2,
      disable: true,
      recordValue: { type: 'text', value: text },
      recordSummary: undefined,
      color,
    },
    {
      type: 'divider',
      thickness: 1,
      valuePath: [],
      key: key + 3,
      disable: false,
    },
  ]
}

export function mkLongText(
  title: string,
  text: string,
  key: string,
  longLines: number
) {
  return [
    {
      type: 'row-with-description',
      left: {
        type: 'title',
        title,
        size: 'sm',
        valuePath: [],
        key: key + 1,
        disable: false,
        recordValue: { type: 'text', value: '' },
        recordSummary: undefined,
      },
      right: {
        type: 'title',
        title: '',
        size: 'sm',
        valuePath: [],
        key: key + 2,
        disable: false,
        recordValue: { type: 'text', value: '' },
        recordSummary: undefined,
      },
      description: {
        type: 'long-text',
        valuePath: [],
        key: key + 3,
        disable: true,
        recordValue: { type: 'text', value: text },
        recordSummary: undefined,
        numberOfLines: longLines,
      },
    },
    {
      type: 'divider',
      thickness: 1,
      valuePath: [],
      key: key + 4,
      disable: false,
    },
  ]
}
