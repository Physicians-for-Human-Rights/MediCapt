import React from 'react'
import { UserType } from 'utils/types/user'
import _ from 'lodash'
import { useStyleSheet, Text, Input } from '@ui-kitten/components'
import themedStyles from '../themeStyled'
import { layout, spacing } from './styles'
import { View } from 'react-native'
import { useStoreState } from '../utils/store'
import { inputStyle, stackStyle } from './UserEditor'

interface IProps {
  user: Partial<UserType>
}

const UserMetaData = (props: IProps) => {
  const { user } = props
  const state = useStoreState()
  const i18n = state?.i18n
  const styleS = useStyleSheet(themedStyles)
  return (
    <>
      <View style={[layout.center, spacing.pt4, spacing.pb2]}>
        <Text category="h5" style={[styleS.px2, styleS.fontNormal]}>
          {i18n.t('user.heading.metadata')}
        </Text>
      </View>
      <View style={stackStyle}>
        <Input
          label={
            i18n.t('user.id') +
            ' (' +
            i18n.t('common.automatically-created') +
            ')'
          }
          value={user.userID ? user.userID : i18n.t('user.not-yet-created')}
          style={inputStyle}
        />
        <Input
          label={
            i18n.t('user.created-on') +
            ' (' +
            i18n.t('common.automatically-created') +
            ')'
          }
          value={
            user && user.created_time
              ? user.created_time.toString()
              : i18n.t('user.not-yet-created')
          }
          style={inputStyle}
        />
      </View>
      <View
        style={[
          layout.hStack,
          layout.alignCenter,
          layout.spaceBet,
          spacing.mt5,
        ]}
      >
        <Input
          label={
            i18n.t('user.last-changed') +
            ' (' +
            i18n.t('common.automatically-created') +
            ')'
          }
          value={
            user.last_updated_time
              ? user.last_updated_time.toString()
              : i18n.t('user.not-yet-created')
          }
          style={inputStyle}
        />
      </View>
    </>
  )
}

export default UserMetaData
