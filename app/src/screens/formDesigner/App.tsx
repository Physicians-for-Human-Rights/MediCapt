import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import Home from 'screens/formDesigner/Home'
import FormEditor from 'screens/formDesigner/FormEditor'
import FormList from 'screens/formDesigner/FormList'
import { RootStackParamList } from 'utils/formDesigner/navigation'
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
          name="FormList"
          component={FormList}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="FormEditor"
          component={FormEditor}
          options={{
            headerShown: false,
            // TODO The signature component causes crashes in SkSurface::getCanvas unless we enable this
            // https://github.com/react-navigation/react-navigation/issues/9061
            animationEnabled: false,
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
