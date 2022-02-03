import React, { useState, useEffect, useMemo } from 'react'
import * as Linking from 'expo-linking'
import { Amplify, I18n, Logger } from 'aws-amplify'
import { Auth } from 'aws-amplify'
import { ActivityIndicator, Image, View } from 'react-native'
import { Text } from 'react-native-elements'
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
import { Button, Card, ButtonGroup } from 'react-native-elements'
import indexOf from 'lodash/indexOf'

import awsConfig from '../../config.js'
import medicapt_logo from '../../assets/medicapt.png'
import phr_logo from '../../assets/phr.png'
import styles from '../styles'

import {
  UserType,
  UserTypeList,
  reconfigureAmplifyForUserType,
} from '../userTypes'

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
          <Button
            onPress={() => Linking.openURL('mailto:help@medicapt.click')}
            title="Ask for help from help@medicapt.click"
          />
          <View />
          <ErrorRow theme={theme}>{this.state.error}</ErrorRow>
        </View>
      </Wrapper>
    )
  }
}

function Header(accountType, setAccountType) {
  return () => (
    <View
      style={{
        height: '50%',
      }}
    >
      <View style={{ jusifyContent: 'center', alignItems: 'center' }}>
        <Text h4 style={{ color: '#d5001c' }}>
          Log in as
        </Text>
        <ButtonGroup
          selectedButtonStyle={{ backgroundColor: '#d5001c' }}
          selectedIndex={accountType - 1 + 1}
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
    </View>
  )
}

function Header2(accountType, setAccountType) {
  return () => (
    <View>
      <View
        style={{
          justifyContent: 'space-around',
          flex: 2,
          flexDirection: 'row',
        }}
      >
        <View style={{ flex: 1 }}>
          <Image source={medicapt_logo} style={styles.logo} />
        </View>
        <View style={{ flex: 1 }}>
          <Image source={phr_logo} style={styles.logo} />
        </View>
      </View>
    </View>
  )
}

export default function withAuthenticator(Component) {
  const AppWithAuthenticator = props => {
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
    const WrappedHeader = Header(accountType, setAccountType)
    const [authState, setAuthState] = useState(null)
    if (accountType === null || accountType === undefined) {
      return <></>
    } else {
      if (authState == 'signedIn') {
        return <Component />
      } else {
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
                <WrappedHeader override={'greetings'} />
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
    }
  }
  return AppWithAuthenticator
}
