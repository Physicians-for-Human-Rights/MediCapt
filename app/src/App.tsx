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
import * as Sentry from 'sentry-expo'
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components'
import { default as themeKitten } from './custom-theme.json'
import * as eva from '@eva-design/eva'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { MaterialIconsPack } from './MaterialIcons' // <-- Import Material icons

Sentry.init({
  dsn: 'https://6fa825c71abb485092554ccb55e4cf67@o1300636.ingest.sentry.io/6535444',
  enableInExpoDevelopment: true,
  tracesSampleRate: 1.0,
  debug: true,
})

i18n.translations = {
  en,
  fr,
}

i18n.locale = Localization.locale
i18n.fallbacks = true
i18n.defaultLocale = 'en'

// This is missing in some environments like Android
// @ts-ignore doesn't have types
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
            <IconRegistry icons={[EvaIconsPack, MaterialIconsPack]} />
            <ApplicationProvider
              {...eva}
              theme={{ ...eva.light, ...themeKitten }}
            >
              <AuthApp />
            </ApplicationProvider>
          </NativeBaseProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </React.StrictMode>
  )
}

export default LoginScreen
