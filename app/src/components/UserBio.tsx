import React, { ReactElement, useState } from 'react'
import { UserType } from 'utils/types/user'
import _ from 'lodash'
import AnyCountry from 'components/AnyCountry'
import Language from 'components/Language'
import DateTimePicker from 'components/DateTimePicker'
import { useStyleSheet, Text, Input } from '@ui-kitten/components'
import themedStyles from '../themeStyled'
import { layout, spacing } from './styles'
import { View, Dimensions } from 'react-native'
import { useStoreState } from '../utils/store'
import { ErrorMsg } from '../components/form-parts/FormParts'

import { emailValidator } from '../utils/helpers'
import { inputStyle, stackStyle, isWider } from './UserEditor'

interface IProps {
  user: Partial<UserType>
  setUser: React.Dispatch<React.SetStateAction<Partial<UserType>>>
  setIsError: React.Dispatch<React.SetStateAction<boolean>>
}

const UserBio = (props: IProps) => {
  const { user, setUser, setIsError } = props

  const state = useStoreState()
  const i18n = state?.i18n
  const [error, setError] = useState<ReactElement>(
    <ErrorMsg text={i18n.t('form.required') as string} />
  )
  const styleS = useStyleSheet(themedStyles)
  const changeEmail = (str: string) => {
    // validate email
    setUser({ ...user, email: str })
    if (!user.email) {
      setError(<ErrorMsg text={i18n.t('form.emailNotValid') as string} />)
      setIsError(true)
    } else if (emailValidator.test(str) === false) {
      // remove alert
      setIsError(true)
      setError(<ErrorMsg text={i18n.t('form.required') as string} />)
    } else if (user.email && emailValidator.test(str)) {
      setError(<></>)
      setIsError(false)
    }
  }
  return (
    <>
      <View style={[layout.center, spacing.pt4, spacing.pb2]}>
        <Text category="h5" style={[styleS.fontNormal, styleS.px2]}>
          {i18n.t('user.heading.bio')}
        </Text>
      </View>
      <View style={stackStyle}>
        <Input
          label={i18n.t('user.short-name')}
          value={user.name}
          onChangeText={v => setUser({ ...user, name: v })}
          style={[inputStyle, { flex: isWider ? 2 : 1 }]}
        />
        <Input
          label={i18n.t('user.nickname')}
          value={user.nickname}
          onChangeText={v => setUser({ ...user, nickname: v })}
          style={[inputStyle, { flex: isWider ? 2 : 1 }]}
        />
      </View>
      <View style={stackStyle}>
        <Input
          label={i18n.t('user.email')}
          value={user.email}
          onChangeText={changeEmail}
          caption={error}
          style={[inputStyle, { flex: isWider ? 2 : 1 }]}
        />
        <Input
          label={i18n.t('user.phone-number-with-help')}
          value={user.phone_number}
          onChangeText={v => setUser({ ...user, phone_number: v })}
          style={[inputStyle, { flex: isWider ? 2 : 1 }]}
        />
      </View>
      <Input
        label={i18n.t('user.address')}
        value={user.address}
        onChangeText={v => setUser({ ...user, address: v })}
        style={inputStyle}
      />
      <View style={[stackStyle]}>
        <Input
          label={i18n.t('user.gender')}
          value={user.gender}
          onChangeText={v => setUser({ ...user, gender: v })}
          style={[inputStyle, { flex: isWider ? 2 : 1 }]}
        />
        <View
          style={[inputStyle, { flex: isWider ? 2 : 1, paddingBottom: 30 }]}
        >
          <DateTimePicker
            isDisabled={false}
            title={i18n.t('user.birthday')}
            fancyLabel={i18n.t('user.birthday')}
            date={user.birthdate}
            open={() => false}
            close={() => false}
            setDate={(date: Date) => setUser({ ...user, birthdate: date })}
          />
        </View>
      </View>
      <View style={[stackStyle, spacing.mr8, spacing.ml2]}>
        <AnyCountry
          placeholder={i18n.t('location.select-country')}
          value={user.country}
          setValue={v => setUser({ ...user, country: v })}
          label={i18n.t('location.select-country')}
        />
        <View style={!isWider && [spacing.pl2, spacing.pt5]}>
          <Language
            placeholder={i18n.t('location.select-default-language')}
            value={user.language}
            setValue={v => setUser({ ...user, language: v })}
            label={i18n.t('location.select-default-language')}
          />
        </View>
      </View>
    </>
  )
}

export default UserBio
