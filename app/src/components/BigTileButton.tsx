import React from 'react'
import { VStack } from 'native-base'
import { StyleSheet, Pressable, View } from 'react-native'
import { Icon } from '@ui-kitten/components'
import { layout } from './styles'
import { colors, rounded, shadow } from './nativeBaseSpec'

export default function BigTileButton({
  navigateTo,
  navigation,
  route,
  icon,
  h = '200px',
  w = '200px',
  label,
  size = 16,
  fontSize = 'lg',
  pack = 'material',
}: {
  navigateTo: string
  navigation: any
  route: any
  icon: string
  h?: string
  w?: string
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
            backgroundColor: colors.primary[600],
            borderRadius: rounded.md,
          },
          shadow[3],
        ]}
        // rounded="md"
      >
        <VStack space={3}>
          <View style={[layout.center]}>
            <Icon
              style={{ width: size, height: 'auto' }}
              fill="white"
              name={icon}
              pack={pack && pack}
            />
          </View>
          <div style={styles.bigTileButton}>{label}</div>
        </VStack>
      </View>
    </Pressable>
  )
}
