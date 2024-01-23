import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import Home from 'screens/provider/Home'
import RecordEditor from 'screens/provider/RecordEditor'
import FindRecord from 'screens/provider/FindRecord'
import FindForm from 'screens/provider/FindForm'
import FindUser from 'screens/provider/FindUser'
import { RootStackParamList } from 'utils/provider/navigation'
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
          name="RecordEditor"
          component={RecordEditor}
          options={{
            headerShown: false,

            // TODO The signature component causes crashes in SkSurface::getCanvas unless we enable this
            // https://github.com/react-navigation/react-navigation/issues/9061
            animationEnabled: false,
          }}
        />
        <RootStack.Screen
          name="FindForm"
          component={FindForm}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="FindRecord"
          component={FindRecord}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="YourRecords"
          component={FindRecord}
          options={{ headerShown: false }}
          initialParams={{ onlyUserRecords: true }}
        />
        <RootStack.Screen
          name="FindUser"
          component={FindUser}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
