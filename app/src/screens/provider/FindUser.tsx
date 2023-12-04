import React from 'react'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import UserSearch from 'components/UserSearch'
import { RootStackScreenProps } from 'utils/provider/navigation'
import { useStoreState } from 'utils/store'

export default function FindUser({
  route,
  navigation,
}: RootStackScreenProps<'FindUser'>) {
  const state = useStoreState()
  const i18n = state?.i18n
  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title={i18n.t('user.find-user')}
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
