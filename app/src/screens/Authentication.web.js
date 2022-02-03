import React, { useState, useEffect, useMemo } from 'react'
import * as Linking from 'expo-linking'
import { Amplify } from 'aws-amplify'
import { Auth } from 'aws-amplify'
import {
  Heading,
  Text,
  Tabs,
  TabItem,
  Flex,
  View,
  Image,
  useTheme,
  Authenticator,
} from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Button, Card, ButtonGroup } from 'react-native-elements'
import awsConfig from '../../config.js'

import indexOf from 'lodash/indexOf'
import medicapt_logo from '../../assets/medicapt.png'
import phr_logo from '../../assets/phr.png'
import styles from '../styles'
import './Authentication.css'

import {
  UserType,
  UserTypeList,
  reconfigureAmplifyForUserType,
} from '../userTypes'

function Header(accountType, setAccountType) {
  const { tokens } = useTheme()
  return () => (
    <View>
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
        <Heading level={6} color="#d5001c" fontWeight="bold">
          Log in as
        </Heading>
      </Flex>
      <ButtonGroup
        selectedButtonStyle={{ backgroundColor: '#d5001c' }}
        selectedIndex={accountType}
        onPress={i => setAccountType(i)}
        buttons={['Healthcare Provider', 'Associate']}
      />
      <ButtonGroup
        selectedButtonStyle={{ backgroundColor: '#d5001c' }}
        selectedIndex={accountType > 1 ? accountType - 2 : -1}
        onPress={i => setAccountType(i + 2)}
        buttons={['User Manager', 'Form Designer', 'Researcher']}
      />
    </View>
  )
}

function Footer() {
  const { tokens } = useTheme()
  return (
    <Card>
      <Button
        onPress={() => Linking.openURL('mailto:help@medicapt.click')}
        title="Ask for help from help@medicapt.click"
      />
    </Card>
  )
}

export default function withAuthenticator(Component) {
  const AppWithAuthenticator: FunctionComponent<T> = props => {
    const [accountType, setAccountType] = useState(null)
    useMemo(async () => {
      const r = await AsyncStorage.getItem('@last_account_selection')
      reconfigureAmplifyForUserType(r)
      setAccountType(indexOf(UserTypeList, r))
      return r
    }, [])
    useEffect(async () => {
      if (accountType !== null) {
        await AsyncStorage.setItem(
          '@last_account_selection',
          UserTypeList[accountType]
        )
        reconfigureAmplifyForUserType(UserTypeList[accountType])
      }
    })

    const defaultComponents = {
      Header: Header(accountType, setAccountType),
      SignIn: {
        Header: Authenticator.SignIn.Header,
        Footer: Authenticator.SignIn.Footer,
      },
      Footer: Footer,
    }
    if (accountType === null || accountType === undefined) {
      return <></>
    } else {
      return (
        <Authenticator components={defaultComponents} variation={'modal'}>
          {({ signOut, user }) => <Component />}
        </Authenticator>
      )
    }
  }
  return AppWithAuthenticator
}
