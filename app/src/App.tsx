import React, { useEffect } from 'react'
import { ThemeProvider } from 'react-native-elements'

import { Provider } from 'react-redux'
import store from 'redux/store'

// @ts-ignore TODO Typescript doesn't support platform-specific files
// https://github.com/microsoft/TypeScript/issues/21926
import withAuthenticator from 'screens/Authentication'

import FormScreen from 'screens/Form'
import SignatureScreen from 'screens/Signature'
import FormOverviewScreen from 'screens/FormOverview'
import SelectFormScreen from 'screens/SelectForm'
import HomeScreen from 'screens/Home'
import BodyScreen from 'screens/Body'
import PlaceholderScreen from 'screens/Placeholder'

import { StoreProvider, useUser, useSignOut } from 'utils/store'

import theme from 'theme'

import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import 'styling'

const Stack = createStackNavigator()

// NB The types here are terrible because we get different types depending on
// which of .native.js or .web.js is included
function App({ signOut, user }: { signOut: () => any; user: any }) {
  const [storeUser, setStoreUser] = useUser()
  const [storeSignOut, setSignOutUser] = useSignOut()
  useEffect(() => setStoreUser(user), [user])
  useEffect(() => {
    setSignOutUser(signOut)
  }, [signOut])
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ gestureEnabled: false }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Medicapt', headerShown: false }}
        />
        <Stack.Screen
          name="Body"
          component={BodyScreen}
          options={{ title: 'Add marks on the diagram' }}
        />
        <Stack.Screen
          name="Other"
          component={PlaceholderScreen}
          options={{ title: 'Lots of features here' }}
        />
        <Stack.Screen
          name="FormOverview"
          component={FormOverviewScreen}
          options={{ title: 'Form overview' }}
        />
        <Stack.Screen
          name="SelectForm"
          component={SelectFormScreen}
          options={{ title: 'Select a form' }}
        />
        <Stack.Screen
          name="Form"
          component={FormScreen}
          options={{ title: 'Fill out the form' }}
        />
        <Stack.Screen
          name="Signature"
          component={SignatureScreen}
          options={{ title: 'Sign anywhere below' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const AuthApp = withAuthenticator(App)

function LoginScreen() {
  return (
    <React.StrictMode>
      <SafeAreaProvider>
        <StoreProvider>
          <Provider store={store}>
            <ThemeProvider theme={theme}>
              <AuthApp />
            </ThemeProvider>
          </Provider>
        </StoreProvider>
      </SafeAreaProvider>
    </React.StrictMode>
  )
}

export default LoginScreen
