import React from 'react'
import { Button as NButton } from 'native-base'
import _ from 'lodash'

export default function Button({
  key,
  text,
  onPress,
  colorScheme = 'blue',
  maxW = '30%',
  icon,
  ...props
}: {
  key: string
  text: string
  onPress: () => any
  colorScheme?: string
  maxW?: string
  icon?: JSX.Element
}) {
  return (
    <NButton
      key={key}
      flex={1}
      _text={{ bold: true }}
      maxW={maxW}
      onPress={onPress}
      leftIcon={icon}
      {...props}
    >
      {text}
    </NButton>
  )
}
