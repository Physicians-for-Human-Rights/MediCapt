import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import Home from 'screens/manager/Home'
import FindUser from 'screens/manager/FindUser'
import FindLocation from 'screens/manager/FindLocation'
import CreateLocation from 'screens/manager/CreateLocation'
import { RootStackParamList } from 'utils/manager/navigation'

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
          initialParams={{ user, signOut }}
        />
        <RootStack.Screen
          name="AddUser"
          component={FindUser}
          options={{
            headerShown: false,
          }}
        />
        <RootStack.Screen
          name="FindUser"
          component={FindUser}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="AddLocation"
          component={CreateLocation}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="FindLocation"
          component={FindLocation}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Settings"
          component={FindLocation}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Training"
          component={FindLocation}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
