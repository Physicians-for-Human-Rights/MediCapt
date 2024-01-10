import React from 'react'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/formDesigner/navigation'
import { useUser } from 'utils/store'
import HomeIndex from '../../components/HomeIndex'
import { HomeOption } from '../../utils/types/home'
import { useStoreState } from '../../utils/store'

export default function ({ route, navigation }: RootStackScreenProps<'Home'>) {
  const state = useStoreState()
  const i18n = state?.i18n
  const options: HomeOption[] = [
    {
      icon: 'add-box',
      label: i18n.t('user.add-user'),
      to: 'EditUser',
    },
    {
      icon: 'search',
      label: i18n.t('user.find-user'),
      to: 'FindUser',
    },
    {
      icon: 'add-location',
      label: i18n.t('location.add-location'),
      to: 'EditLocation',
    },
    {
      icon: 'map',
      label: i18n.t('location.find-location'),
      to: 'FindLocation',
    },
  ]
  // const [user] = useUser()
  const user = {
    attributes: {
      nickname: 'nickname',
    },
  }
  if (!user || !user.attributes) return <></>
  return (
    <DashboardLayout
      title={
        i18n.t('general.welcome') + ' ' + (user && user.attributes.nickname)
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
