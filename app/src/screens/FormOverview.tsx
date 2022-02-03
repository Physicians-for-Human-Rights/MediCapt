import React from 'react'
import {
  ActivityIndicator,
  StatusBar,
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  createSwitchNavigator,
  createAppContainer,
  SafeAreaView,
} from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'

import Amplify from 'aws-amplify'
import config from '../../config.js'

import styles from '../styles'

class FormOverview extends React.Component {
  static navigationOptions = {
    title: 'Lots of features here',
  }
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Woof</Text>
      </SafeAreaView>
    )
  }
}

export default FormOverview
