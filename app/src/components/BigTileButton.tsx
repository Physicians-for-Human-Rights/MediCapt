import React from 'react'
import { StyleSheet, Pressable, View } from 'react-native'
import { Icon } from '@ui-kitten/components'
import { layout } from './styles'
import { colors, rounded, shadow } from './nativeBaseSpec'

export default function BigTileButton({
  navigateTo,
  navigation,
  route,
  icon,
  h = 200,
  w = 200,
  label,
  size = 64,
  fontSize = 'lg',
  pack = 'material',
}: {
  navigateTo: string
  navigation: any
  route: any
  icon: string
  h?: number
  w?: number
  label: string
  size?: number
  fontSize?: string
  pack?: string
}) {
  const styles = StyleSheet.create({
    bigTileButton: {
      fontWeight: 'bold',
      color: 'white',
      fontSize: +fontSize,
    },
  })
  console.log('icon size', size)
  return (
    <Pressable
      // m={2}
      onPress={() => navigation.navigate(navigateTo, route.params)}
    >
      <View
        style={[
          layout.center,
          {
            height: h,
            width: w,
            backgroundColor: colors.primary[500],
            borderRadius: rounded.md,
            margin: 8,
          },
          shadow[3],
        ]}
        // rounded="md"
      >
        <View style={layout.vStackGap3}>
          <View style={[layout.center]}>
            <Icon
              style={{ width: size, height: size, color: 'white' }}
              fill="#ffffff"
              name={icon}
              pack={pack}
            />
          </View>
          <div style={styles.bigTileButton}>{label}</div>
        </View>
      </View>
    </Pressable>
  )
}
