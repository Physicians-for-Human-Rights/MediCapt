import React from 'react'
import { StatusBar, Button } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from 'styles'
import { useSignOut } from 'utils/store'

function Placeholder() {
  const [signOut] = useSignOut()
  return (
    <SafeAreaView style={styles.container}>
      <Button title="I'm done, sign me out" onPress={signOut} />
      <StatusBar barStyle="default" />
    </SafeAreaView>
  )
}

export default Placeholder
