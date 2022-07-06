import React from 'react'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import UserSearch from 'components/UserSearch'
import { RootStackScreenProps } from 'utils/provider/navigation'

export default function FindUser({
  route,
  navigation,
}: RootStackScreenProps<'FindUser'>) {
  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title="Find a user"
    >
      <UserSearch
        selectItem={user => {
          route.params.selectUser(user)
          navigation.goBack()
        }}
        defaultUserType={'Associate'}
        allowedUserTypes={['Provider', 'Associate']}
        defaultLocationUUID={route.params.defaultLocationUUID}
      />
    </DashboardLayout>
  )
}
