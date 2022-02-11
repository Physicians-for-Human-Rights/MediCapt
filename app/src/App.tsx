import React, { useEffect } from 'react'
import { ThemeProvider } from 'react-native-elements'

import { Provider } from 'react-redux'
import store from 'redux/store'

// @ts-ignore TODO Typescript doesn't support platform-specific files
// https://github.com/microsoft/TypeScript/issues/21926
import withAuthenticator from 'screens/Authentication'

import { StoreProvider, useUser, useSignOut } from 'utils/store'

import oldTheme, { theme } from 'theme'
import { UserType } from 'utils/userTypes'

import { SafeAreaProvider } from 'react-native-safe-area-context'

import { default as ProviderApp } from 'screens/provider/App'
import { default as AssociateApp } from 'screens/associate/App'
import { default as UserManagerApp } from 'screens/userManager/App'
import { default as FormDesignerApp } from 'screens/formDesigner/App'
import { default as ResearcherApp } from 'screens/researcher/App'

import { NativeBaseProvider } from 'native-base'

// NB Remove me eventually
import 'styling'

import * as Localization from 'expo-localization'
import i18n from 'i18n-js'
import en from 'localization/en'

i18n.translations = {
  en,
}

i18n.locale = Localization.locale
i18n.fallbacks = true
i18n.defaultLocale = 'en'

// NB The types here are terrible because we get different types depending on
// which of .native.js or .web.js is included
function App({
  signOut,
  user,
  userType,
}: {
  signOut: () => any
  user: any
  userType: UserType
}) {
  switch (userType) {
    case UserType.Provider:
      return <ProviderApp signOut={signOut} user={user} />
    case UserType.Associate:
      return <AssociateApp signOut={signOut} user={user} />
    case UserType.UserManager:
      return <UserManagerApp signOut={signOut} user={user} />
    case UserType.FormDesigner:
      return <FormDesignerApp signOut={signOut} user={user} />
    case UserType.Researcher:
      return <ResearcherApp signOut={signOut} user={user} />
  }
}

const AuthApp = withAuthenticator(App)

function LoginScreen() {
  return (
    // TODO Remove SafeAreaProvider after the native base switch
    <SafeAreaProvider>
      <NativeBaseProvider theme={theme}>
        <StoreProvider>
          <Provider store={store}>
            <ThemeProvider theme={oldTheme}>
              <AuthApp />
            </ThemeProvider>
          </Provider>
        </StoreProvider>
      </NativeBaseProvider>
    </SafeAreaProvider>
  )
}

export default LoginScreen
