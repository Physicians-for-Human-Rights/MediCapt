import React from 'react'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import UserSearch from 'components/UserSearch'

export default function FindUser({ route, navigation }: any) {
  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title="Find a user"
    >
      <UserSearch
        selectItem={(user, setRefresh) => {
          navigation.navigate('EditUser', {
            ...route.params,
            user,
            setRefresh,
          })
        }}
      />
    </DashboardLayout>
  )
}
