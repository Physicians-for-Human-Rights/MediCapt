import React, { useState, useEffect, useMemo } from 'react'
import * as Linking from 'expo-linking'
import { Flex, Image, useTheme, Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ButtonGroup from 'components/form-parts/ButtonGroup'
import { View } from 'react-native'
import { Button, Text, useStyleSheet, Icon } from '@ui-kitten/components'

import indexOf from 'lodash/indexOf'
import medicapt_logo from '../../assets/medicapt.png'
import phr_logo from '../../assets/phr.png'
import './Authentication.css'
import themedStyles from '../themeStyled'

import {
  UserKind,
  UserKindList,
  UserKindNames,
  reconfigureAmplifyForUserKind,
} from 'utils/userTypes'

import UserLanguage from '../components/UserLanguage'
import { layout, spacing } from '../components/styles'
import { useStoreState } from 'utils/store'

function Header(userKind, setAccountType) {
  const state = useStoreState()
  const i18n = state.i18n
  const styleS = useStyleSheet(themedStyles)
  const { tokens } = useTheme()
  return () => (
    <View style={{ backgroundColor: 'white', paddingBottom: 24 }}>
      <Flex
        direction="row"
        justifyContent="space-around"
        alignItems="center"
        alignContent="center"
        wrap="nowrap"
      >
        <Image alt="Amplify logo" src={phr_logo} width={'50%'} />
        <Image alt="Amplify logo" src={medicapt_logo} width={'20%'} />
      </Flex>
      <Flex
        direction="row"
        justifyContent="space-around"
        alignItems="center"
        alignContent="center"
        wrap="nowrap"
      >
        <Text
          style={[styleS.fontBold, styleS.mb2]}
          category="h5"
          status="basic"
        >
          {i18n.t('user.logInAs')}
        </Text>
      </Flex>
      <ButtonGroup
        selected={userKind}
        options={{
          [UserKindNames[UserKind.Provider]]: UserKind.Provider,
          [UserKindNames[UserKind.Associate]]: UserKind.Associate,
        }}
        onPress={setAccountType}
        pt={2}
        pb={1}
        colorScheme="primary"
        justifyContent="center"
      />
      <ButtonGroup
        selected={userKind}
        options={{
          [UserKindNames[UserKind.Manager]]: UserKind.Manager,
          [UserKindNames[UserKind.FormDesigner]]: UserKind.FormDesigner,
          [UserKindNames[UserKind.Researcher]]: UserKind.Researcher,
        }}
        onPress={setAccountType}
        pb={3}
        colorScheme="primary"
        justifyContent="center"
      />
    </View>
  )
}

function Footer() {
  const state = useStoreState()
  const i18n = state.i18n
  return (
    <View style={{ backgroundColor: '#fff', padding: 16 }}>
      <Button
        onPress={() => Linking.openURL('mailto:help@medicapt.click')}
        appearance="outline"
      >
        {i18n.t('general.askForHelp')} help@medicapt.click
      </Button>
      <View
        style={[
          layout.hStackCenterGap2,
          layout.width100percent,
          layout.alignCenter,
          spacing.mt2,
        ]}
      >
        <UserLanguage />
        {/* <Icon
          name="language"
          style={{ width: 24, height: 24, color: '#424242' }}
        />
        <View style={layout.width45percent}>
          <UserLanguage />
        </View> */}
      </View>
    </View>
  )
}

export default function withAuthenticator(Component) {
  const AppWithAuthenticator = props => {
    const [userKind, setAccountType] = useState(null)
    useMemo(async () => {
      let r = await AsyncStorage.getItem('@last_account_selection')
      if (indexOf(UserKindList, r) < 0) {
        r = UserKind.Provider
      }
      setAccountType(r)
      reconfigureAmplifyForUserKind(r)
    }, [])
    useEffect(() => {
      async function fn() {
        if (userKind !== null) {
          reconfigureAmplifyForUserKind(userKind)
          await AsyncStorage.setItem('@last_account_selection', userKind)
        }
      }
      fn()
    })

    const defaultComponents = {
      Header: Header(userKind, setAccountType),
      SignIn: {
        Header: Authenticator.SignIn.Header,
        Footer: Authenticator.SignIn.Footer,
      },
      Footer: Footer,
    }

    if (userKind === null || userKind === undefined) {
      return <></>
    } else {
      return (
        <Authenticator components={defaultComponents} variation="modal">
          {({ signOut, user }) => (
            <Component signOut={signOut} user={user} userKind={userKind} />
          )}
        </Authenticator>
      )
    }
  }
  return AppWithAuthenticator
}
