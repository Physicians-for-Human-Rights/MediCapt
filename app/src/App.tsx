import React, { useEffect } from 'react'

// @ts-ignore TODO Typescript doesn't support platform-specific files
// https://github.com/microsoft/TypeScript/issues/21926
import withAuthenticator from 'screens/Authentication'

import { StoreProvider, useUser, useSignOut } from 'utils/store'

import { theme } from 'theme'
import { UserKind } from 'utils/userTypes'

import { SafeAreaProvider } from 'react-native-safe-area-context'

import { default as ProviderApp } from 'screens/provider/App'
import { default as AssociateApp } from 'screens/associate/App'
import { default as ManagerApp } from 'screens/manager/App'
import { default as FormDesignerApp } from 'screens/formDesigner/App'
import { default as ResearcherApp } from 'screens/researcher/App'

import { NativeBaseProvider } from 'native-base'

import * as Localization from 'expo-localization'
import i18n from 'i18n-js'
import en from 'localization/en'
import fr from 'localization/fr'

i18n.translations = {
  en,
  fr,
}

i18n.locale = Localization.locale
i18n.fallbacks = true
i18n.defaultLocale = 'en'

// This is missing in some environments like Android
import { decode, encode } from 'base-64'
if (!global.btoa) {
  global.btoa = encode
}
if (!global.atob) {
  global.atob = decode
}

// NB The types here are terrible because we get different types depending on
// which of .native.js or .web.js is included
function App({
  signOut,
  user,
  userKind,
}: {
  signOut: () => any
  user: any
  userKind: UserKind
}) {
  const [storeUser, setStoreUser] = useUser()
  const [storeSignOut, setStoreSignOut] = useSignOut()

  useEffect(() => {
    setStoreUser(user)
    setStoreSignOut(signOut)
  }, [user, signOut])

  switch (userKind) {
    case UserKind.Provider:
      return <ProviderApp />
    case UserKind.Associate:
      return <AssociateApp />
    case UserKind.Manager:
      return <ManagerApp />
    case UserKind.FormDesigner:
      return <FormDesignerApp />
    case UserKind.Researcher:
      return <ResearcherApp />
  }
}

const AuthApp = withAuthenticator(App)

function LoginScreen() {
  return (
    // TODO Remove SafeAreaProvider after the native base switch
    <React.StrictMode>
      <SafeAreaProvider>
        <StoreProvider>
          <NativeBaseProvider
            theme={theme}
            config={{ suppressColorAccessibilityWarning: true }}
          >
            <AuthApp />
          </NativeBaseProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </React.StrictMode>
  )
}

export default LoginScreen
