import React from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import styles from 'styles'

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
