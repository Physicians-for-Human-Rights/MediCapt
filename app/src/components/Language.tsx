import React, { useEffect, useState } from 'react'
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

  console.log({ any })
  const itemsArr: string[] = [t('languages.' + 'en'), t('languages.' + 'fr')]
  if (!!any) {
    itemsArr.unshift(t(any))
  }
  const [displayVal, setDisplayVal] = useState<string>(itemsArr[0])
  const onSelect = (index: IndexPath) => {
    setSelectedIndex(index)
    if (any && index.row === 0) {
      setValue('')
    } else {
      const i = index.row - 1
      setValue(languages[i])
    }

    setDisplayVal(itemsArr[index.row])
  }

  return (
    <Select
      // style={{ backgroundColor: bg }}
      selectedIndex={selectedIndex}
      onSelect={index => onSelect(index as IndexPath)}
      value={displayVal || itemsArr[0]}
    >
      {itemsArr?.map(item => {
        return <SelectItem key={item} title={item} />
      })}
    </Select>
  )
}
