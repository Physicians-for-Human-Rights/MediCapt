import React, { useRef, useState } from 'react'
import {
  Input,
  useStyleSheet,
  CheckBox,
  Select,
  SelectItem,
  IndexPath,
} from '@ui-kitten/components'
import useDebounce from 'react-use/lib/useDebounce'
import _ from 'lodash'
import { MultipleFormValueTypes, FormKVRawType } from 'utils/types/form'
import { t } from 'i18n-js'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import { disabledBackground } from 'utils/formRendering/utils'
import uuid from 'react-native-uuid'
import { View } from 'react-native'
import { layout } from 'components/styles'
import themedStyles from 'themeStyled'

const styleS = useStyleSheet(themedStyles)

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
          <CheckBox
            // forces React to re-render component as opposed
            // to using an old one (with outdated togglePathValue)
            key={uuid.v4() as string}
            status="info"
            style={[styleS.my2]}
            checked={values[index]}
            value={_.toString(index)}
            onChange={() => togglePathValue(index)}
            accessibilityLabel={t('form.select-the-option') + ' ' + option}
            disabled={isDisabled}
          >
            {option}
          </CheckBox>
        )
      })
    : []
  if (other && otherChecked !== undefined) {
    items.push(
      <CheckBox
        // forces React to re-render component as opposed
        // to using an old one (with outdated togglePathValue)
        key={uuid.v4() as string}
        checked={otherChecked}
        // value="other"
        onChange={toggleOtherChecked}
        status="info"
        style={[styleS.my2]}
        accessibilityLabel={t('form.select-other-option')}
        disabled={isDisabled}
      >
        Other
      </CheckBox>
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
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>()
  const onSelectLocal = (index: IndexPath) => {
    setSelectedIndex(index)
    let arr: any[] | null = options
    if (other && withLabels) {
      const obj = { key: '', value: '__other__' }
      arr?.push(obj)
    } else {
      arr?.push('__other__')
    }
    if (arr?.length) {
      const item = arr[index.row]
      if (withLabels) {
        onSelect(item.value)
      } else {
        onSelect(item)
      }
    }
  }
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
        disabled={isDisabled}
        size="medium"
        // selectedValue={
        //   value === undefined || value === null ? '' : _.toString(value)
        // }
        selectedIndex={selectedIndex}
        style={{ minWidth: 200 }}
        placeholder={t('form.select-value')}
        onSelect={index => onSelectLocal(index as IndexPath)}
        // onValueChange={itemValue => {
        //   if (itemValue != null) {
        //     onSelect(itemValue)
        //   }
        // }}
      >
        <>
          {options &&
            options
              .map((e, i) => {
                if (withLabels) {
                  return (
                    <SelectItem
                      key={i}
                      title={e.key + ' (' + e.value + ')'}
                      // value={_.toString(e.value)}
                    />
                  )
                } else {
                  return (
                    <SelectItem
                      key={`second-select`}
                      title={_.toString(e)}
                      // value={_.toString(e)}
                    />
                  )
                }
              })
              .concat(
                other
                  ? [
                      <SelectItem
                        key={-1}
                        title="Other"
                        // value="__other__"
                      />,
                    ]
                  : []
              )}
        </>
      </Select>
      {other && onOtherValue && value === '__other__' && (
        <Input
          disabled={isDisabled}
          style={[styleS.mt2, styleS.width80Percent]}
          size="mdium"
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
