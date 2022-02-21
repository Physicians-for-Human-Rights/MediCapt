import React from 'react'
import { Box, Input, Center, Select, Checkbox } from 'native-base'
import useDebounce from 'react-use/lib/useDebounce'
import _ from 'lodash'
import { RecordPath } from 'utils/recordTypes'
import {
  MultipleFormValueTypes,
  FormPart,
  FormPartField,
  FormDefinition,
  FormKVRawType,
} from 'utils/formTypes'
import { t } from 'i18n-js'

export function isPrimitiveType(x: any) {
  return _.isString(x) || _.isBoolean(x) || _.isNumber(x)
}

// TODO Forbid all labels like ^__.*__$

export function ListSelectMultiple({
  values,
  otherChecked,
  otherText,
  options,
  other,
  setPathValue,
  setOtherChecked,
  setOtherText,
}: {
  values: boolean[]
  otherChecked: boolean | null
  otherText: string | undefined
  options: MultipleFormValueTypes | undefined
  other: 'text' | 'long-text' | undefined
  setPathValue: (idx: number, b: boolean) => any
  setOtherChecked: (b: boolean | null) => any
  setOtherText: (s: string | undefined) => any
}) {
  const [rawContents, setRawContents] = React.useState(otherText)
  useDebounce(
    () => {
      setOtherText(rawContents)
    },
    300,
    [rawContents]
  )
  const items =
    options && _.isArray(options)
      ? // @ts-ignore TODO type this
        options.map((e: string, i: number) => {
          return (
            <Checkbox
              key={i}
              colorScheme="blue"
              isChecked={values[i]}
              defaultIsChecked={values[i]}
              value={_.toString(i)}
              my={2}
              onChange={state => setPathValue(i, state)}
            >
              {e}
            </Checkbox>
          )
        })
      : []
  if (other && otherChecked !== null) {
    items.push(
      <Checkbox
        key={-1}
        colorScheme="blue"
        isChecked={otherChecked}
        value={'other'}
        my={2}
        onChange={setOtherChecked}
      >
        Other
      </Checkbox>
    )
  }
  return (
    <Center>
      <Checkbox.Group colorScheme="blue">{items}</Checkbox.Group>
      {otherChecked && (
        <Input
          key={items.length}
          w="80%"
          size="md"
          placeholder={'Details about other (optional)'}
          multiline={true}
          numberOfLines={5}
          onChangeText={setRawContents}
          value={rawContents}
        />
      )}
    </Center>
  )
}

export function List({
  withLabels = false,
  options,
  value,
  onSelect,
  other,
  otherValue,
  onOtherValue,
  debounceMs = 300,
}: {
  value: string | null
  onSelect: (s: string | null) => any
  other?: 'text' | 'long-text'
  otherValue: string | null
  onOtherValue: (s: string) => any | null
  debounceMs?: number
} & (
  | {
      withLabels?: true
      options: FormKVRawType[] | null
    }
  | {
      withLabels?: false
      options: string[] | boolean[] | number[] | null
    }
)) {
  const [rawContents, setRawContents] = React.useState(
    (otherValue === null || otherValue === undefined
      ? ''
      : otherValue) as string
  )
  useDebounce(
    () => {
      other && onOtherValue(rawContents)
    },
    debounceMs,
    [rawContents]
  )
  return (
    <Center>
      <Select
        size="md"
        selectedValue={
          value === undefined || value === null ? '' : _.toString(value)
        }
        placeholder={t('form.select-value')}
        onValueChange={itemValue => {
          if (itemValue != null) {
            onSelect(itemValue)
          }
        }}
      >
        {options &&
          options
            .map((e, i) => {
              if (withLabels) {
                return (
                  <Select.Item
                    size="md"
                    key={i}
                    label={e.key + ' (' + e.value + ')'}
                    value={_.toString(e.value)}
                  />
                )
              } else {
                return (
                  <Select.Item
                    size="md"
                    label={_.toString(e)}
                    value={_.toString(e)}
                  />
                )
              }
            })
            .concat(
              other
                ? [
                    <Select.Item
                      key={-1}
                      size="md"
                      label="Other"
                      value="__other__"
                    />,
                  ]
                : []
            )}
      </Select>
      {other && onOtherValue && value === '__other__' && (
        <Input
          mt={2}
          w="80%"
          size="md"
          placeholder={t('form.other-details')}
          multiline={true}
          numberOfLines={5}
          onChangeText={setRawContents}
          value={rawContents}
        />
      )}
    </Center>
  )
}
