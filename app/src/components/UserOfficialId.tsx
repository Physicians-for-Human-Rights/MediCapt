import React, { useState } from 'react'
import { userTypes, UserType } from 'utils/types/user'
import FloatingLabelInput from 'components/FloatingLabelInput'
import _ from 'lodash'
import { Dimensions } from 'react-native'

import Photo from 'components/form-parts/Photo'
import DateTimePicker from 'components/DateTimePicker'
import { Button, useStyleSheet, Text, Input } from '@ui-kitten/components'
import themedStyles from '../themeStyled'
import { layout, spacing } from './styles'

import { View } from 'react-native'
import { useStoreState } from '../utils/store'
import { inputStyle, isWider, stackStyle } from './UserEditor'

interface IProps {
  user: Partial<UserType>
  setUser: React.Dispatch<React.SetStateAction<Partial<UserType>>>
}
const dummyDate = new Date()
const windowWidth = Dimensions.get('window').width

const UserOfficialId = (props: IProps) => {
  const { user, setUser } = props
  const state = useStoreState()
  const i18n = state?.i18n
  const styleS = useStyleSheet(themedStyles)
  return (
    <>
      <View style={[layout.center, spacing.pt4, spacing.pb2]}>
        <Text category="h5" style={[styleS.fontNormal, styleS.px2]}>
          {i18n.t('user.heading.official-id')}
        </Text>
      </View>
      <View style={stackStyle}>
        <Input
          label={i18n.t('user.official_id_type')}
          value={user.official_id_type}
          onChangeText={(v: string) =>
            setUser({ ...user, official_id_type: v })
          }
          style={[inputStyle, { flex: isWider ? 2 : 1 }]}
        />
        <View style={{ flex: isWider ? 2 : 1 }}>
          <DateTimePicker
            isDisabled={false}
            // @ts-ignore TODO Why not?
            title={i18n.t('user.official_id_expires')}
            fancyLabel={i18n.t('user.official_id_expires')}
            date={user.official_id_expires}
            open={() => false}
            close={() => false}
            setDate={(date: Date) =>
              setUser({ ...user, official_id_expires: date })
            }
          />
        </View>
      </View>
      <FloatingLabelInput
        label={i18n.t('user.official_id_code')}
        value={user.official_id_code}
        setValue={v => setUser({ ...user, official_id_code: v })}
      />
      <View
        style={[
          layout.hStack,
          layout.alignCenter,
          layout.spaceBet,
          spacing.mx6,
        ]}
      >
        <Photo
          photos={
            user.official_id_image && user.official_id_image !== 'none'
              ? [{ uri: user.official_id_image, 'date-taken': dummyDate }]
              : []
          }
          addPhoto={p => setUser({ ...user, official_id_image: p.uri })}
          removePhoto={p => setUser({ ...user, official_id_image: 'none' })}
          isDisabled={false}
          onlyOne={true}
        />
      </View>
    </>
  )
}

export default UserOfficialId
