import React from 'react'
import { StatusBar, Button } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import { NavigationStackScreenProps } from 'react-navigation-stack'
import styles from 'styles'
import { Auth } from 'aws-amplify'

type Props = NavigationStackScreenProps

class Placeholder extends React.Component<Props> {
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

export default Placeholder
