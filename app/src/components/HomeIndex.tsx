import React from 'react'
import BigTileButton from 'components/BigTileButton'
import { Dimensions, SafeAreaView, FlatList, View } from 'react-native'
import styles, { spacing, layout } from './styles'
import { breakpoints } from './nativeBaseSpec'
import { HomeOption } from 'utils/types/home'
import { RootStackScreenProps } from 'utils/formDesigner/navigation'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md

interface Props extends RootStackScreenProps<'Home'> {
  shape: any
  options: HomeOption[]
}
const HomeIndex = (props: Props) => {
  const { shape, options, navigation, route } = props
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
  )
}

export default HomeIndex
