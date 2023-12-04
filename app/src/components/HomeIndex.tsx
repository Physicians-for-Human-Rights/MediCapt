import React from 'react'
import BigTileButton from 'components/BigTileButton'
import {
  Dimensions,
  SafeAreaView,
  FlatList,
  View,
  Platform,
} from 'react-native'
import styles, { spacing, layout } from './styles'
import { breakpoints } from './nativeBaseSpec'
import { HomeOption } from 'utils/types/home'
import { RootStackScreenProps } from 'utils/formDesigner/navigation'
import { useBreakpointValue } from '../hooks/useBreakpointValue'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md

interface Props extends RootStackScreenProps<'Home'> {
  options: HomeOption[]
}
const HomeIndex = (props: Props) => {
  const { options, navigation, route } = props
  const shape = useBreakpointValue({
    base: { columns: 2, w: 160, h: 160, size: 32, fontSize: 16 },
    sm: { columns: 2, w: 190, h: 190, size: 64, fontSize: 18 },
    md: {
      columns: Platform.OS === 'web' ? 3 : 2,
      w: 200,
      h: 200,
      size: 64,
      fontSize: 18,
    },
  })
  return (
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
          data={options.length ? options : []}
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
  )
}

export default HomeIndex
