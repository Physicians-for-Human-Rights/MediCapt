import React from 'react'
import { useBreakpointValue } from '../../hooks/useBreakpointValue'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/formDesigner/navigation'
import { useUser } from 'utils/store'
import { Platform } from 'react-native'
import { HomeOption } from 'utils/types/home'
import HomeIndex from 'components/HomeIndex'

const options: HomeOption[] = [
  {
    icon: 'add-box',
    label: 'Create a new record',
    to: 'FindForm',
  },
  {
    icon: 'search',
    label: 'Find a record',
    to: 'FindRecord',
  },
  {
    icon: 'history',
    label: 'Your records',
    to: 'YourRecords',
  },
  {
    icon: 'share',
    label: 'Sharing',
    to: 'Sharing',
  },
  {
    icon: 'settings',
    label: 'Settings',
    to: 'Settings',
  },
  {
    icon: 'school',
    label: 'Training',
    to: 'Training',
  },
]

export default function ({ route, navigation }: RootStackScreenProps<'Home'>) {
  const shape = useBreakpointValue({
    base: { columns: 2, w: 160, h: 160, size: 32, fontSize: 'medium' },
    sm: { columns: 2, w: 190, h: 190, size: 64, fontSize: 'large' },
    md: {
      columns: Platform.OS === 'web' ? 3 : 2,
      w: 200,
      h: 200,
      size: 64,
      fontSize: 'lg',
    },
  })
  const user = {
    attributes: {
      nickname: 'nickname',
    },
  }
  // const [user] = useUser()
  if (!user || !user.attributes) return <></>
  return (
    <DashboardLayout
      title={'Welcome ' + (user ? user.attributes.nickname : '')}
      displaySidebar={false}
      displayScreenTitle={false}
      backButton={false}
      navigation={navigation}
      showLogos
    >
      <HomeIndex
        shape={shape}
        options={options}
        navigation={navigation}
        route={route}
      />
    </DashboardLayout>
  )
}
