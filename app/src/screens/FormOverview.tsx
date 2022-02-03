import React from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import styles from 'styles'

const FormOverview = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Woof</Text>
    </SafeAreaView>
  )
}

FormOverview.navigationOptions = {
  title: 'Lots of features here',
}

export default FormOverview
