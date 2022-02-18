import React, { useState, useEffect, useMemo } from 'react'
import * as Linking from 'expo-linking'
import { Amplify, I18n, Logger } from 'aws-amplify'
import { Auth } from 'aws-amplify'
import { ActivityIndicator, Image, View } from 'react-native'
import { Button, Heading } from 'native-base'
import {
  Greetings,
  SignIn,
  ConfirmSignIn,
  RequireNewPassword,
  VerifyContact,
  ForgotPassword,
  Loading,
  Authenticator,
  AuthPiece,
  Wrapper,
  AmplifyButton,
  FormField,
  LinkCell,
  Header as RawHeader,
  ErrorRow,
} from 'aws-amplify-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import indexOf from 'lodash/indexOf'
import ButtonGroup from 'components/form-parts/ButtonGroup'

import awsConfig from '../../config.js'
import medicapt_logo from '../../assets/medicapt.png'
import phr_logo from '../../assets/phr.png'
import styles from '../styles'

import {
  UserType,
  UserTypeList,
  UserTypeNames,
  reconfigureAmplifyForUserType,
} from 'utils/userTypes'

const logger = new Logger('SignIn')

class CustomSignIn extends AuthPiece {
  constructor(props) {
    super(props)

    this._validAuthStates = ['signIn', 'signedOut', 'signedUp']
    this.state = {
      username: null,
      password: null,
      error: null,
    }

    this.checkContact = this.checkContact.bind(this)
    this.signIn = this.signIn.bind(this)
  }

  signIn() {
    const username = this.getUsernameFromInput() || ''
    const { password } = this.state
    logger.debug('Sign In for ' + username)
    return Auth.signIn(username, password)
      .then(user => {
        logger.debug(user)
        const requireMFA = user.Session !== null
        if (user.challengeName === 'SMS_MFA') {
          this.changeState('confirmSignIn', user)
        } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
          logger.debug('require new password', user.challengeParam)
          this.changeState('requireNewPassword', user)
        } else {
          this.checkContact(user)
        }
      })
      .catch(err => this.error(err))
  }

  showComponent(theme) {
    return (
      <Wrapper>
        <View style={theme.section}>
          <View style={theme.sectionBody}>
            {this.renderUsernameField(theme)}
            <FormField
              theme={theme}
              onChangeText={text => this.setState({ password: text })}
              label={I18n.get('Password')}
              placeholder={I18n.get('Enter your password')}
              secureTextEntry={true}
              required={true}
            />
            <AmplifyButton
              text={I18n.get('Sign In').toUpperCase()}
              theme={theme}
              onPress={this.signIn}
              disabled={!this.getUsernameFromInput() && this.state.password}
            />
          </View>
          <View style={theme.sectionFooter}>
            <LinkCell
              theme={theme}
              onPress={() => this.changeState('forgotPassword')}
            >
              {I18n.get('Forgot Password')}
            </LinkCell>
          </View>
          <Button onPress={() => Linking.openURL('mailto:help@medicapt.click')}>
            Ask for help from help@medicapt.click
          </Button>
          <View />
          <ErrorRow theme={theme}>{this.state.error}</ErrorRow>
        </View>
      </Wrapper>
    )
  }
}

function Header(userType, setAccountType) {
  return () => (
    <View
      style={{
        height: '50%',
      }}
    >
      <View style={{ jusifyContent: 'center', alignItems: 'center' }}>
        <Heading size="md" color="#d5001c">
          Log in as
        </Heading>
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
          size="md"
          flex={0}
          maxW="40%"
        />
        <ButtonGroup
          selected={userType}
          options={{
            [UserTypeNames[UserType.UserManager]]: UserType.UserManager,
            [UserTypeNames[UserType.FormDesigner]]: UserType.FormDesigner,
            [UserTypeNames[UserType.Researcher]]: UserType.Researcher,
          }}
          onPress={setAccountType}
          pb={3}
          colorScheme="red"
          size="md"
          flex={0}
          maxW="40%"
        />
      </View>
    </View>
  )
}

export default function withAuthenticator(Component) {
  const AppWithAuthenticator = () => {
    const [authState, setAuthState] = useState(null)
    const [userType, setAccountType] = useState(null)
    const [user, setUser] = useState(null)
    useMemo(async () => {
      let r = await AsyncStorage.getItem('@last_account_selection')
      if (indexOf(UserTypeList, r) < 0) {
        r = UserType.Provider
      }
      setAccountType(r)
      reconfigureAmplifyForUserType(r)
      return r
    }, [])
    useEffect(async () => {
      if (userType !== null) {
        await AsyncStorage.setItem('@last_account_selection', userType)
        reconfigureAmplifyForUserType(userType)
      }
    })
    useEffect(async () => {
      if (authState === 'signedIn') {
        setUser(await Auth.currentAuthenticatedUser())
      } else {
        setUser(null)
      }
    }, [authState])
    const WrappedHeader = Header(userType, setAccountType)
    if (userType === null || userType === undefined) {
      return <></>
    }
    if (authState == 'signedIn' && user) {
      return <Component user={user} userType={userType} />
    }
    return (
      <>
        <Authenticator
          onStateChange={newAuthState => {
            setAuthState(newAuthState)
          }}
          hide={[Greetings, SignIn, ForgotPassword]}
          hideDefault={true}
        >
          <View
            style={{
              height: '50%',
            }}
          >
            <View
              style={{
                justifyContent: 'space-around',
                flex: 2,
                flexDirection: 'row',
                height: '10%',
              }}
            >
              <Image source={medicapt_logo} style={styles.logo} />
              <Image source={phr_logo} style={styles.logo} />
            </View>
            <WrappedHeader override="greetings" />
          </View>
          <CustomSignIn />
          <ConfirmSignIn />
          <RequireNewPassword />
          <VerifyContact />
          <ForgotPassword />
          <Loading />
        </Authenticator>
      </>
    )
  }
  return AppWithAuthenticator
}
