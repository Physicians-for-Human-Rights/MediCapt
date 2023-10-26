import React, { useState } from 'react'
import { t } from 'i18n-js'
import _ from 'lodash'
import {
  Select,
  SelectItem,
  SelectItemProps,
  SelectProps,
  IndexPath,
} from '@ui-kitten/components'
export const languages = ['en', 'fr']

export default function Language({
  placeholder,
  value,
  setValue,
  bg,
  any,
  itemProps,
  ...props
}: {
  placeholder: string
  value: string | undefined
  setValue: (val: string) => any
  bg?: string
  any?: string
  itemProps?: SelectItemProps
} & SelectProps) {
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>(
    new IndexPath(0)
  )
  const onSelect = (index: IndexPath) => {
    setSelectedIndex(index)
    if (any) {
      setValue('')
    }
    setValue(languages[index.row])
  }
  return (
    <Select
      style={{ backgroundColor: bg }}
      size="medium"
      selectedIndex={selectedIndex}
      onSelect={index => onSelect(index as IndexPath)}
      // selectedValue={value}
      placeholder={placeholder}
      // onValueChange={setValue}
      {...props}
    >
      {_.concat(
        any
          ? [<SelectItem key={'__any__'} title={t(any)} {...itemProps} />]
          : [],
        languages.map(e => (
          <SelectItem
            key={e}
            title={t('languages.' + e)}
            // value={e}
            {...itemProps}
          />
        ))
      )}
    </Select>
  )
}
