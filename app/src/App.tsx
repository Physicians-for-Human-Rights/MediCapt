import React from 'react'
import { createAppContainer, SafeAreaView } from 'react-navigation'
import {
  createStackNavigator,
  NavigationStackScreenProps,
} from 'react-navigation-stack'
import { ThemeProvider } from 'react-native-elements'

import { Provider } from 'react-redux'
import store from 'redux/store'

import withAuthenticator from 'screens/Authentication'

import FormScreen from 'screens/Form'
import SignatureScreen from 'screens/Signature'
import FormOverviewScreen from 'screens/FormOverview'
import SelectFormScreen from 'screens/SelectForm'
import HomeScreen from 'screens/Home'
import BodyScreen from 'screens/Body'
import PlaceholderScreen from 'screens/Placeholder'

import theme from 'theme'

const AppContainer = createAppContainer(
  createStackNavigator(
    {
      Home: HomeScreen,
      Body: BodyScreen,
      Other: PlaceholderScreen,
      FormOverview: FormOverviewScreen,
      SelectForm: SelectFormScreen,
      Form: FormScreen,
      Signature: SignatureScreen,
    },
    {
      initialRouteName: 'Home',
    }
  )
)

function App() {
  return <AppContainer />
}

const AuthApp = withAuthenticator(App)

function LoginScreen() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AuthApp />
      </ThemeProvider>
    </Provider>
  )
}

export default LoginScreen
