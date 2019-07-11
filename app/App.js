import React from 'react';
import { Platform, ActivityIndicator, StatusBar, AsyncStorage, Button, StyleSheet, Text, View } from 'react-native';
import { createStackNavigator, createSwitchNavigator, createAppContainer, SafeAreaView } from "react-navigation";

import Amplify from "aws-amplify";
import { Auth } from "aws-amplify";
import config from "./config.js";

import Authentication from "./src/Authentication";

Amplify.configure({
    Auth: {
        mandatorySignIn: true,
        region: config.cognito.REGION,
        userPoolId: config.cognito.USER_POOL_ID,
        identityPoolId: config.cognito.IDENTITY_POOL_ID,
        userPoolWebClientId: config.cognito.APP_CLIENT_ID
    },
    Analytics: { 
        disabled: true
    },
    API: {
        endpoints: [
            {
                name: "records",
                endpoint: config.apiGateway.URL,
                region: config.apiGateway.REGION
            },
        ]
    },
    Storage: {
        AWSS3: {
            bucket: config.s3.BUCKET,
            region: config.s3.REGION
        }
    }
});

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Welcome to the app!',
  };
  render() {
    return (
      <SafeAreaView>
        <Button title="Show me more of the app" onPress={this._showMoreApp} />
        <Button title="Sign out" onPress={this._signOutAsync} />
        <Button title="Sign out everywhere" onPress={this._signOutAsyncEverywhere} />
      </SafeAreaView>
    );
  }
  _showMoreApp = () => {
    this.props.navigation.navigate('Other');
  };
  _signOutAsync = async () => {
      Auth.signOut()
          .then(data => this.props.navigation.navigate('Authentication'))
          .catch(err => {
              console.log(err)
              this.props.navigation.navigate('Authentication')
          }); // TODO What else can we do?
  };
  _signOutAsyncEverywhere = async () => {
      Auth.signOut({global: true})
          .then(data => this.props.navigation.navigate('Authentication'))
          .catch(err => {
              console.log(err)
              this.props.navigation.navigate('Authentication')
          }); // TODO What else can we do?
  };
}

class OtherScreen extends React.Component {
  static navigationOptions = {
    title: 'Lots of features here',
  };
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Button title="I'm done, sign me out" onPress={this._signOutAsync} />
        <StatusBar barStyle="default" />
      </SafeAreaView>
    );
  }
  _signOutAsync = async () => {
      Auth.signOut()
          .then(data => this.props.navigation.navigate('Authentication'))
          .catch(err => this.props.navigation.navigate('Authentication')); // TODO What else can we do?
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const AppStack = createStackNavigator({ Home: HomeScreen, Other: OtherScreen });

export default createAppContainer(createSwitchNavigator(
  {
    Authentication: Authentication,
    App: AppStack
  },
  {
    initialRouteName: 'Authentication'
  }
));
