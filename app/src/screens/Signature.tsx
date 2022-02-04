import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Header } from 'react-native-elements'
import styles_ from 'styles'
import SignatureComponent from 'components/Signature'

const Signature = ({ navigation }) => {
  const onCancel = () => {
    navigation.state.params.cancelSignature()
    navigation.goBack()
  }

  const onSubmit = (signature: string) => {
    navigation.state.params.signed(signature)
    navigation.goBack()
  }

  return (
    <View style={styles_.container}>
      <Header
        centerComponent={{
          text: 'Sign anywhere below',
          style: { color: '#fff' },
        }}
        containerStyle={styles.headerContainer}
      />
      <View style={styles.signatureContainer}>
        <SignatureComponent onSubmit={onSubmit} onCancel={onCancel} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#d5001c',
    justifyContent: 'space-around',
    width: '100%',
  },
  signatureContainer: {
    flex: 1,
    width: '100%',
  },
})

export default Signature
