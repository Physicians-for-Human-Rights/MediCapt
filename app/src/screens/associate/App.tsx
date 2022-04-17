import React from 'react'
import { NativeBaseProvider, Box, Button } from 'native-base'
import { useSignOut } from 'utils/store'

export default function App({}: {}) {
  const [signOut] = useSignOut()
  return (
    <NativeBaseProvider>
      <Box>Associate</Box>
      <Button onPress={signOut}>Sign out</Button>
    </NativeBaseProvider>
  )
}
