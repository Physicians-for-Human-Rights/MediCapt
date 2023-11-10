import React from 'react'
import { useBreakpointValue } from '../../hooks/useBreakpointValue'
import BigTileButton from 'components/BigTileButton'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/formDesigner/navigation'
import { useUser } from 'utils/store'
import {
  Platform,
  View,
  SafeAreaView,
  Dimensions,
  FlatList,
} from 'react-native'
import styles, { layout, spacing } from '../../components/styles'
import { breakpoints } from '../../components/nativeBaseSpec'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md
const options = [
  {
    icon: 'search',
    label: 'Find a share',
    to: 'FindShare',
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
      <SafeAreaView
        style={[
          styles.formDesignerView,
          {
            borderRadius: isWider ? 8 : 0,
            paddingHorizontal: isWider ? 32 : 4,
          },
        ]}
      >
        <View style={[layout.center, spacing.pt5]}>
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
                pack="material"
              />
            )}
            key={shape.columns}
            keyExtractor={item => item.to}
          />
        </View>
      </SafeAreaView>
    </DashboardLayout>
  )
}
