import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import Home from 'screens/manager/Home'
import EditUser from 'screens/manager/EditUsers'
import FindUser from 'screens/manager/FindUser'
import FindLocation from 'screens/manager/FindLocation'
import EditLocation from 'screens/manager/EditLocation'
import { RootStackParamList } from 'utils/manager/navigation'
import { useUserLocations } from 'utils/store'

const RootStack = createStackNavigator<RootStackParamList>()

export default function App({}: {}) {
  // This preloads information about the locations we have access to
  useUserLocations()
  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Home">
        <RootStack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="EditUser"
          component={EditUser}
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
          name="EditLocation"
          component={EditLocation}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="FindLocation"
          component={FindLocation}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
