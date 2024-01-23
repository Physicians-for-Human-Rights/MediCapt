import React, { useState } from 'react'
import { userTypes, UserType } from 'utils/types/user'
import _ from 'lodash'

import { Select, SelectItem, IndexPath, Input } from '@ui-kitten/components'
import { layout } from './styles'
import { View } from 'react-native'
import { useStoreState } from '../utils/store'
import { requiredText } from '../components/form-parts/FormParts'
import { inputStyle } from './UserEditor'

interface IProps {
  user: Partial<UserType>
  setUser: React.Dispatch<React.SetStateAction<Partial<UserType>>>
}

const UserBasicInfo = (props: IProps) => {
  const { user, setUser } = props
  const state = useStoreState()
  const i18n = state?.i18n
  const createMode = !(user.userUUID && user.userUUID !== '')
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>(
    new IndexPath(0)
  )
  const onSelect = (index: IndexPath) => {
    setSelectedIndex(index)
    setUser({ ...user, userType: userTypes[index.row] })
  }
  const onChangeUesrname = (str: string) => {
    if (createMode) {
      setUser({ ...user, username: str })
    }
  }
  return (
    <>
      <Input
        label={i18n.t('user.full-official-name')}
        value={user.formal_name}
        onChangeText={v => setUser({ ...user, formal_name: v })}
        style={inputStyle}
        status={user.formal_name ? 'basic' : 'danger'}
        caption={user.formal_name ? '' : requiredText}
      />
      <View style={[layout.hStack, layout.spaceBet]}>
        <Input
          label={
            i18n.t('user.username') +
            (createMode ? '' : ' (' + i18n.t('common.read-only') + ')')
          }
          value={user.username}
          placeholder={user.username}
          onChangeText={onChangeUesrname}
          style={[{ flex: 2 }, inputStyle]}
          caption={user.username ? '' : requiredText}
        />
        {createMode ? (
          <>
            <Select
              label={i18n.t('user.user-type')}
              size="medium"
              selectedIndex={selectedIndex}
              placeholder={i18n.t('user.user-type')}
              style={[{ flex: 2 }, inputStyle]}
              onSelect={index => onSelect(index as IndexPath)}
              value={userTypes[selectedIndex.row]}
              // onValueChange={itemValue => {
              //   if (itemValue != null) {
              //     // @ts-ignore this value comes from user.entityType, which is correct
              //     setUser({ ...user, userType: itemValue })
              //   }
              // }}
            >
              {userTypes.map((e, i) => (
                <SelectItem key={e} title={i18n.t('user.' + e)} />
              ))}
            </Select>
          </>
        ) : (
          <Input
            label={
              i18n.t('user.user-type') + ' (' + i18n.t('common.read-only') + ')'
            }
            value={i18n.t('user.' + user.userType)}
            style={[{ flex: 2 }, inputStyle]}
          />
        )}
      </View>
    </>
  )
}

export default UserBasicInfo
