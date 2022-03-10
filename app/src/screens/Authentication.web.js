import React, { useState, useEffect, useMemo } from 'react'
import * as Linking from 'expo-linking'
import {
  Heading,
  Flex,
  View,
  Image,
  useTheme,
  Authenticator,
} from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ButtonGroup from 'components/form-parts/ButtonGroup'
import { Button, Box } from 'native-base'

import indexOf from 'lodash/indexOf'
import medicapt_logo from '../../assets/medicapt.png'
import phr_logo from '../../assets/phr.png'
import styles from '../styles'
import './Authentication.css'

import {
  UserType,
  UserTypeList,
  UserTypeNames,
  reconfigureAmplifyForUserType,
} from 'utils/userTypes'

function Header(userType, setAccountType) {
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
        <Heading level={5} color="#d5001c" fontWeight="bold">
          Log in as
        </Heading>
      </Flex>
      <ButtonGroup
        selected={userType}
        options={{
          [UserTypeNames[UserType.Provider]]: UserType.Provider,
          [UserTypeNames[UserType.Associate]]: UserType.Associate,
        }}
        onPress={setAccountType}
        pt={2}
        pb={1}
        colorScheme="red"
        justifyContent="center"
      />
      <ButtonGroup
        selected={userType}
        options={{
          [UserTypeNames[UserType.Manager]]: UserType.Manager,
          [UserTypeNames[UserType.FormDesigner]]: UserType.FormDesigner,
          [UserTypeNames[UserType.Researcher]]: UserType.Researcher,
        }}
        onPress={setAccountType}
        pb={3}
        colorScheme="red"
        justifyContent="center"
      />
    </View>
  )
}

function Footer() {
  return (
    <Box bg="#fff" p={4}>
      <Button onPress={() => Linking.openURL('mailto:help@medicapt.click')}>
        Ask for help from help@medicapt.click
      </Button>
    </Box>
  )
}

export default function withAuthenticator(Component) {
  const AppWithAuthenticator = props => {
    const [userType, setAccountType] = useState(null)
    useMemo(async () => {
      let r = await AsyncStorage.getItem('@last_account_selection')
      if (indexOf(UserTypeList, r) < 0) {
        r = UserType.Provider
      }
      setAccountType(r)
      reconfigureAmplifyForUserType(r)
    }, [])
    useEffect(() => {
      async function fn() {
        if (userType !== null) {
          reconfigureAmplifyForUserType(userType)
          await AsyncStorage.setItem('@last_account_selection', userType)
        }
      }
      fn()
    })

    const defaultComponents = {
      Header: Header(userType, setAccountType),
      SignIn: {
        Header: Authenticator.SignIn.Header,
        Footer: Authenticator.SignIn.Footer,
      },
      Footer: Footer,
    }

    if (userType === null || userType === undefined) {
      return <></>
    } else {
      return (
        <Authenticator components={defaultComponents} variation="modal">
          {({ signOut, user }) => (
            <Component signOut={signOut} user={user} userType={userType} />
          )}
        </Authenticator>
      )
    }
  }
  return AppWithAuthenticator
}
