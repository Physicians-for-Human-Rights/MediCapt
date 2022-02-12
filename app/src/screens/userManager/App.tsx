import React from 'react'
import { NativeBaseProvider, Box, Button } from 'native-base'

export default function App({
  signOut,
  user,
}: {
  signOut: () => any
  user: any
}) {
  return (
    <NativeBaseProvider>
      <Box>User manager</Box>
      <Button onPress={signOut}>Sign out</Button>
    </NativeBaseProvider>
  )
}