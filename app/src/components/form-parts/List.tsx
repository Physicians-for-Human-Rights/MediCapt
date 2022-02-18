import React from 'react'
import { Box, Input, Center, Select, Checkbox } from 'native-base'
import useDebounce from 'react-use/lib/useDebounce'
import _ from 'lodash'
import { FormPart, FormPartField } from 'utils/formTypes'
import { RecordPath } from 'utils/recordTypes'
import { FormDefinition, FormKVRawType } from 'utils/formTypes'
import { t } from 'i18n-js'

export function isPrimitiveType(x: any) {
  return _.isString(x) || _.isBoolean(x) || _.isNumber(x)
}

export function ListSelectMultiple({
  valuePaths,
  part,
  formPath,
  otherPath,
  otherPathValue,
  getPath,
  setPath,
}: {
  valuePaths: RecordPath[]
  formPath: RecordPath
  otherPath: RecordPath | null
  otherPathValue: RecordPath | null
  getPath: any
  setPath: any
  part: FormPart & (FormPartField & { type: 'list-multiple' })
}) {
  const [rawContents, setRawContents] = React.useState(
    getPath(otherPathValue, _.isString, '')
  )
  useDebounce(
    () => {
      setPath(otherPathValue, rawContents)
    },
    300,
    [rawContents]
  )

  const items =
    'options' in part && _.isArray(part.options)
      ? // @ts-ignore TODO type this
        part.options.map((e: string, i: number) => {
          let valuePath = valuePaths[i]
          return (
            <Checkbox
              key={i}
              colorScheme="blue"
              isChecked={getPath(valuePath, _.isBoolean, false)}
              value={_.join(valuePath, '.')}
              my={2}
              onChange={state => setPath(valuePath, state)}
            >
              {e}
            </Checkbox>
          )
        })
      : []
  if (part.other && otherPath !== null) {
    items.push(
      <Checkbox
        key={-1}
        colorScheme="blue"
        isChecked={getPath(otherPath, _.isBoolean, false)}
        value={_.join(otherPath, '.')}
        my={2}
        onChange={state => setPath(otherPath, state)}
      >
        Other
      </Checkbox>
    )
  }
  return (
    <Center key={_.join(formPath, '.')}>
      <Checkbox.Group colorScheme="blue">{items}</Checkbox.Group>
      {getPath(otherPath, _.isBoolean, false) && (
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

// TODO Forbid all labels like ^__.*__$

export function List({
  key,
  withLabels = false,
  options,
  value,
  onSelect,
  other,
  otherValue,
  onOtherValue,
  debounceMs = 300,
}: {
  key: string | number | undefined
  value: string | null
  onSelect: (s: string | null) => any
  other?: 'text' | 'long-text'
  otherValue: string | null
  onOtherValue: (s: string) => any | null
  debounceMs?: number
} & (
  | {
      withLabels?: true
      options: FormKVRawType[]
    }
  | {
      withLabels?: false
      options: string[] | boolean[] | number[]
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
        {options
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
