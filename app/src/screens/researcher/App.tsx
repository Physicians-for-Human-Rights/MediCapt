import React from 'react'
import { NativeBaseProvider } from 'native-base'
import { useSignOut } from 'utils/store'
import { View } from 'react-native'
import { Button } from '@ui-kitten/components'

export default function App({}: {}) {
  const [signOut] = useSignOut()
  return (
    <NativeBaseProvider>
      <View>Researcher</View>
      <Button onPress={signOut}>Sign out</Button>
    </NativeBaseProvider>
  )
}
