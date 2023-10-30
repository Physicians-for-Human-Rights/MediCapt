import React from 'react'
import {
  Button as NButton,
  ButtonProps,
  useStyleSheet,
} from '@ui-kitten/components'
import _ from 'lodash'
import themedStyles from '../../themeStyled'

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
  onPress: () => void
  colorScheme?: string
  maxW?: string
  icon?: JSX.Element
} & Partial<ButtonProps>) {
  const styleS = useStyleSheet(themedStyles)
  return (
    <NButton
      key={key}
      style={[styleS.flex1, styleS.fontBold, { maxWidth: maxW }]}
      onPress={onPress}
      accessoryLeft={icon}
      {...props}
    >
      {text}
    </NButton>
  )
}
