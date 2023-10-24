import React, { useRef } from 'react'
import { Input, Select, Checkbox } from 'native-base'
import useDebounce from 'react-use/lib/useDebounce'
import _ from 'lodash'
import { MultipleFormValueTypes, FormKVRawType } from 'utils/types/form'
import { t } from 'i18n-js'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import { disabledBackground } from 'utils/formRendering/utils'
import uuid from 'react-native-uuid'
import { View } from 'react-native'
import { layout } from 'components/styles'

export function isPrimitiveType(x: any) {
  return _.isString(x) || _.isBoolean(x) || _.isNumber(x)
}

// TODO Forbid all labels like ^__.*__$

export function ListSelectMultiple({
  options,
  values,
  other,
  otherChecked,
  otherText,
  togglePathValue,
  toggleOtherChecked,
  setOtherText,
  isDisabled,
}: {
  options: MultipleFormValueTypes | undefined
  values: boolean[]
  other?: 'text' | 'long-text'
  otherChecked?: boolean
  otherText?: string
  togglePathValue: (idx: number) => void
  toggleOtherChecked: () => void
  setOtherText: (s: string | undefined) => void
  isDisabled: boolean
}) {
  const [rawContents, setRawContents] = React.useState(otherText)
  // NB useDebouce fires on start. We don't want that here, it modifies records
  const firstDebounce = useRef(true)
  useDebounce(
    () => {
      if (!firstDebounce.current) {
        other && setOtherText(rawContents)
      } else firstDebounce.current = false
    },
    300,
    [rawContents]
  )
  const items = options
    ? options.map((option, index) => {
        return (
          <Checkbox
            // forces React to re-render component as opposed
            // to using an old one (with outdated togglePathValue)
            key={uuid.v4() as string}
            colorScheme="blue"
            isChecked={values[index]}
            value={_.toString(index)}
            my={2}
            onChange={() => togglePathValue(index)}
            accessibilityLabel={t('form.select-the-option') + ' ' + option}
            isDisabled={isDisabled}
          >
            {option}
          </Checkbox>
        )
      })
    : []
  if (other && otherChecked !== undefined) {
    items.push(
      <Checkbox
        // forces React to re-render component as opposed
        // to using an old one (with outdated togglePathValue)
        key={uuid.v4() as string}
        isChecked={otherChecked}
        value="other"
        onChange={toggleOtherChecked}
        colorScheme="blue"
        my={2}
        accessibilityLabel={t('form.select-other-option')}
        isDisabled={isDisabled}
      >
        Other
      </Checkbox>
    )
  }
  return (
    <View
      style={[
        layout.center,
        { backgroundColor: isDisabled ? disabledBackground : undefined },
      ]}
    >
      <View style={[layout.vStack]}>{items}</View>
      {otherChecked && (
        <DebouncedTextInput
          key={items.length}
          isDisabled={isDisabled}
          debounceMs={500}
          w="80%"
          size="md"
          placeholder={'Details about other (optional)'}
          multiline={true}
          numberOfLines={5}
          onChangeText={setRawContents}
          value={rawContents}
          accessibilityLabel={t('form.other-details')}
        />
      )}
    </View>
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
  isDisabled,
}: {
  value: string | null
  onSelect: (s: string | null) => void
  other?: 'text' | 'long-text'
  otherValue: string | null
  onOtherValue: (s: string) => void | null
  debounceMs?: number
  isDisabled: boolean
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
  // NB useDebouce fires on start. We don't want that here, it modifies records
  const firstDebounce = useRef(true)
  useDebounce(
    () => {
      if (!firstDebounce.current) {
        other && onOtherValue(rawContents)
      } else firstDebounce.current = false
    },
    debounceMs,
    [rawContents]
  )
  return (
    <View
      style={[
        layout.center,
        { backgroundColor: isDisabled ? disabledBackground : undefined },
      ]}
    >
      <Select
        isDisabled={isDisabled}
        size="md"
        selectedValue={
          value === undefined || value === null ? '' : _.toString(value)
        }
        placeholder={t('form.select-value')}
        minWidth="200"
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
          isDisabled={isDisabled}
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
    </View>
  )
}
