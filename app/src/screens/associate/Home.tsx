import React from 'react'
import { VStack, Center, FlatList, useBreakpointValue } from 'native-base'
import BigTileButton from 'components/BigTileButton'
import { MaterialIcons } from '@expo/vector-icons'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/formDesigner/navigation'
import { useUser } from 'utils/store'
import { Platform } from 'react-native'
import * as Sentry from 'sentry-expo'

const options = [
  {
    icon: <MaterialIcons name="search" />,
    label: 'Find a share',
    to: 'FindShare',
  },
  {
    icon: <MaterialIcons name="settings" />,
    label: 'Settings',
    to: 'Settings',
  },
  {
    icon: <MaterialIcons name="school" />,
    label: 'Training',
    to: 'Training',
  },
]

export default function ({ route, navigation }: RootStackScreenProps<'Home'>) {
  const shape = useBreakpointValue({
    base: { columns: 2, w: '160px', h: '160px', size: 8, fontSize: 'md' },
    sm: { columns: 2, w: '190px', h: '190px', size: 16, fontSize: 'lg' },
    md: {
      columns: Platform.OS === 'web' ? 3 : 2,
      w: '200px',
      h: '200px',
      size: 16,
      fontSize: 'lg',
    },
  })
  const [user] = useUser()
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
      <VStack
        safeAreaBottom
        height="90%"
        borderRadius={{ md: '8' }}
        borderColor="coolGray.200"
        bg="white"
        px={{
          base: 4,
          md: 32,
        }}
      >
        <Center pt="5">
          <FlatList
            numColumns={shape.columns}
            data={options}
            renderItem={({ item }) => (
              <BigTileButton
                icon={item.icon}
                label={item.label}
                navigation={navigation}
                route={route}
                navigateTo={item.to}
                w={shape.w}
                h={shape.h}
                size={shape.size}
                fontSize={shape.fontSize}
              />
            )}
            key={shape.columns}
            keyExtractor={item => item.to}
          />
        </Center>
      </VStack>
    </DashboardLayout>
  )
}
