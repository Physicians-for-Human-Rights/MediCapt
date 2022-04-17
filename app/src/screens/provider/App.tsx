import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import Home from 'screens/provider/Home'
import FormEditor from 'screens/provider/FormEditor'
import FindRecord from 'screens/provider/FindRecord'
import { RootStackParamList } from 'utils/provider/navigation'

const RootStack = createStackNavigator<RootStackParamList>()

export default function App({}: {}) {
  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Home">
        <RootStack.Screen
          name="Home"
          component={Home}
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
        <RootStack.Screen
          name="FindRecord"
          component={FindRecord}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="IncompleteRecords"
          component={FindRecord}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Sharing"
          component={FindRecord}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Settings"
          component={FindRecord}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Training"
          component={FindRecord}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
