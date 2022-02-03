import React from 'react'
import { StatusBar, Button } from 'react-native'
import { createAppContainer, SafeAreaView } from 'react-navigation'
import {
  createStackNavigator,
  NavigationStackScreenProps,
} from 'react-navigation-stack'
import { ThemeProvider } from 'react-native-elements'
import styles from 'styles'
import { Auth } from 'aws-amplify'

import { Provider } from 'react-redux'
import store from 'redux/store'

import withAuthenticator from 'screens/Authentication'

import FormScreen from 'screens/Form'
import SignatureScreen from 'screens/Signature'
import FormOverviewScreen from 'screens/FormOverview'
import SelectFormScreen from 'screens/SelectForm'
import HomeScreen from 'screens/Home'
import BodyScreen from 'screens/Body'

import theme from 'theme'

type Props = NavigationStackScreenProps

class OtherScreen extends React.Component<Props> {
  static navigationOptions = {
    title: 'Lots of features here',
  }
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Button title="I'm done, sign me out" onPress={this._signOutAsync} />
        <StatusBar barStyle="default" />
      </SafeAreaView>
    )
  }
  _signOutAsync = async () => {
    Auth.signOut()
      .then(data => this.props.navigation.navigate('Authentication'))
      .catch(err => this.props.navigation.navigate('Authentication')) // TODO What else can we do?
  }
}

const AppContainer = createAppContainer(
  createStackNavigator(
    {
      Home: HomeScreen,
      Body: BodyScreen,
      Other: OtherScreen,
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
