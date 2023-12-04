import React from 'react'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/formDesigner/navigation'
import { useUser } from 'utils/store'
import { HomeOption } from 'utils/types/home'
import HomeIndex from 'components/HomeIndex'
import { useStoreState } from 'utils/store'
import { Text } from '@ui-kitten/components'

export default function ({ route, navigation }: RootStackScreenProps<'Home'>) {
  const state = useStoreState()
  const i18n = state?.i18n
  const options: HomeOption[] = [
    {
      icon: 'add-box',
      label: i18n.t('record.create-record'),
      to: 'FindForm',
    },
    {
      icon: 'search',
      label: i18n.t('record.find-record'),
      to: 'FindRecord',
    },
    {
      icon: 'history',
      label: i18n.t('record.your-record'),
      to: 'YourRecords',
    },
    {
      icon: 'share',
      label: i18n.t('general.sharing'),
      to: 'Sharing',
    },
    {
      icon: 'settings',
      label: i18n.t('general.settings'),
      to: 'Settings',
    },
    {
      icon: 'school',
      label: i18n.t('general.training'),
      to: 'Training',
    },
  ]
  const user = {
    attributes: {
      nickname: 'nickname',
    },
  }
  // const [user] = useUser()
  if (!user || !user.attributes) return <></>
  return (
    <DashboardLayout
      title={
        i18n.t('general.welcome') + ' ' + (user ? user.attributes.nickname : '')
      }
      displaySidebar={false}
      displayScreenTitle={false}
      backButton={false}
      navigation={navigation}
      showLogos
    >
      <HomeIndex options={options} navigation={navigation} route={route} />
    </DashboardLayout>
  )
}
