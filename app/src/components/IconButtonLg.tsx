import React from 'react'

import { View } from 'react-native'
import { Icon, Button } from '@ui-kitten/components'
import { colors } from './nativeBaseSpec'

interface IProps {
  name: string
  size: number
  onPress: VoidFunction
  color: string
}
const IconButtonLg = (props: IProps) => {
  const { name, size, onPress, color } = props
  return (
    <View style={{ width: size, height: size, marginRight: 24 }}>
      <Button
        onPress={onPress}
        appearance="ghost"
        size="large"
        status="control"
        style={{
          padding: 0,
          maxWidth: size,
          maxHeight: size,
          backgroundColor: color,
        }}
        accessoryLeft={
          <Icon
            name={name}
            pack="material"
            style={{
              maxWidth: size,
              maxHeight: size,
            }}
          />
        }
      />
    </View>
  )
}

export default IconButtonLg
