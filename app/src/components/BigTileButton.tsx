import React from 'react'
import { Icon, VStack, Center, Pressable } from 'native-base'
import { StyleSheet } from 'react-native'

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
}: {
  navigateTo: string
  navigation: any
  route: any
  icon: JSX.Element
  h?: string
  w?: string
  label: string
  size?: number
  fontSize?: string
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
      m={2}
      onPress={() => navigation.navigate(navigateTo, route.params)}
    >
      <Center h={h} w={w} bg="primary.600" rounded="md" shadow={3}>
        <VStack space={3}>
          <Center>
            <Icon as={icon} color="white" size={size} />
          </Center>
          <div style={styles.bigTileButton}>{label}</div>
        </VStack>
      </Center>
    </Pressable>
  )
}
