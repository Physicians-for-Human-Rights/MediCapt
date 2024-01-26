import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import Home from 'screens/associate/Home'
import ShareViewer from 'screens/associate/ShareViewer'
import FindShare from 'screens/associate/FindShare'
import { RootStackParamList } from 'utils/associate/navigation'
import { useUserLocations } from 'utils/store'

const RootStack = createStackNavigator<RootStackParamList>()

export default function App({}: {}) {
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
          name="FindShare"
          component={FindShare}
          options={{
            headerShown: false,
          }}
        />
        <RootStack.Screen
          name="ShareViewer"
          component={ShareViewer}
          options={{ headerShown: false }}
        />
        {/*<RootStack.Screen*/}
        {/*  name="Settings"*/}
        {/*  component={FindShare}*/}
        {/*  options={{ headerShown: false }}*/}
        {/*/>*/}
        {/*<RootStack.Screen*/}
        {/*  name="Training"*/}
        {/*  component={FindShare}*/}
        {/*  options={{ headerShown: false }}*/}
        {/*/>*/}
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
