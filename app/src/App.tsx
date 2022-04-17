import React, { useEffect } from 'react'

// @ts-ignore TODO Typescript doesn't support platform-specific files
// https://github.com/microsoft/TypeScript/issues/21926
import withAuthenticator from 'screens/Authentication'

import { StoreProvider, useUser, useSignOut } from 'utils/store'

import { theme } from 'theme'
import { UserType } from 'utils/userTypes'

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
  const [storeUser, setStoreUser] = useUser()
  const [storeSignOut, setStoreSignOut] = useSignOut()

  useEffect(() => {
    setStoreUser(user)
    setStoreSignOut(signOut)
  }, [user, signOut])

  switch (userType) {
    case UserType.Provider:
      return <ProviderApp />
    case UserType.Associate:
      return <AssociateApp />
    case UserType.Manager:
      return <ManagerApp />
    case UserType.FormDesigner:
      return <FormDesignerApp />
    case UserType.Researcher:
      return <ResearcherApp />
  }
}

const AuthApp = withAuthenticator(App)

function LoginScreen() {
  return (
    // TODO Remove SafeAreaProvider after the native base switch
    <React.StrictMode>
      <SafeAreaProvider>
        <NativeBaseProvider
          theme={theme}
          config={{ suppressColorAccessibilityWarning: true }}
        >
          <StoreProvider>
            <AuthApp />
          </StoreProvider>
        </NativeBaseProvider>
      </SafeAreaProvider>
    </React.StrictMode>
  )
}

export default LoginScreen
