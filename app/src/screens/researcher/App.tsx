import React from 'react'
import { NativeBaseProvider, Button } from 'native-base'
import { useSignOut } from 'utils/store'
import { View } from 'react-native'

export default function App({}: {}) {
  const [signOut] = useSignOut()
  return (
    <NativeBaseProvider>
      <View>Researcher</View>
      <Button onPress={signOut}>Sign out</Button>
    </NativeBaseProvider>
  )
}
