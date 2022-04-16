import React from 'react'
import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  Center,
  Button,
  Pressable,
  Divider,
  Hidden,
  Square,
  Circle,
  FlatList,
  useBreakpointValue,
} from 'native-base'
import BigTileButton from 'components/BigTileButton'
import { MaterialIcons } from '@expo/vector-icons'
import DashboardLayout from 'components/DashboardLayout'
import {
  RootStackScreenProps,
  RootStackParamList,
} from 'utils/formDesigner/navigation'

const options = [
  {
    icon: <MaterialIcons name="add-box" />,
    label: 'Add a user',
    to: 'EditUser',
  },
  {
    icon: <MaterialIcons name="search" />,
    label: 'Find a user',
    to: 'FindUser',
  },
  {
    icon: <MaterialIcons name="add-location" />,
    label: 'Add a location',
    to: 'EditLocation',
  },
  {
    icon: <MaterialIcons name="map" />,
    label: 'Find a location',
    to: 'FindLocation',
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
    md: { columns: 2, w: '200px', h: '200px', size: 16, fontSize: 'lg' },
  })
  return (
    <DashboardLayout
      title={'Welcome ' + route.params.user.attributes.nickname}
      displaySidebar={false}
      displayScreenTitle={false}
      backButton={false}
      navigation={navigation}
      signOut={route.params.signOut}
      user={route.params.user}
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
