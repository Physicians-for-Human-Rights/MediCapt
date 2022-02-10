import React from 'react'
import { NativeBaseProvider, Box, Button } from 'native-base'
import { NavigationContainer } from '@react-navigation/native'
import {
  RootStackScreenProps,
  RootStackParamList,
} from 'utils/formDesigner/navigation'
import { createStackNavigator } from '@react-navigation/stack'
import Home from 'screens/formDesigner/Home'

const RootStack = createStackNavigator<RootStackParamList>()

export default function App({
  signOut,
  user,
}: {
  signOut: () => any
  user: any
}) {
  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Home">
        <RootStack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
