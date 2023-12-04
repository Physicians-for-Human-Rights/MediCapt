import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { Select, SelectItem, IndexPath, Icon } from '@ui-kitten/components'
import { useStoreState, useStoreDispatch } from '../utils/store'
import { View } from 'react-native'
import { layout } from './styles'

export const availLang = ['en', 'en-gb']

const UserLanguage = () => {
  const state = useStoreState()
  const i18n = state?.i18n
  const dispatch = useStoreDispatch()

  const [selectedIndex, setSelectedIndex] = useState<IndexPath>(
    new IndexPath(0)
  )

  const itemsArr: string[] = [
    i18n.t('languages.' + 'en'),
    i18n.t('languages.' + 'en-gb'),
  ]

  const [displayVal, setDisplayVal] = useState<string>(itemsArr[0])
  const onSelect = (index: IndexPath) => {
    setSelectedIndex(index)
    dispatch({ type: 'SET_LANGUAGE', language: availLang[index.row] })
    setDisplayVal(itemsArr[index.row])
  }

  return (
    <>
      <Icon
        name="language"
        style={{ width: 24, height: 24, color: '#424242', marginRight: 8 }}
      />
      <View style={layout.width45percent}>
        <Select
          selectedIndex={selectedIndex}
          onSelect={index => onSelect(index as IndexPath)}
          value={displayVal || itemsArr[0]}
        >
          {itemsArr?.map(item => {
            return <SelectItem key={item} title={item} />
          })}
        </Select>
        {/* <Language placeholder="Select langage" /> */}
      </View>
    </>
  )
}

export default UserLanguage
