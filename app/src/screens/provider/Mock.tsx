import React from 'react'
import {
  Platform,
  SafeAreaView,
  Dimensions,
  FlatList,
  View,
} from 'react-native'
import { Text } from '@ui-kitten/components'
import DashboardLayout from 'components/DashboardLayout'

const Mock = () => {
  return (
    <DashboardLayout
      title="hi Test user"
      displaySidebar={false}
      displayScreenTitle={false}
      backButton={false}
      navigation="nav mock"
    >
      <Text category="h1">this is test view</Text>
    </DashboardLayout>
  )
}

export default Mock
