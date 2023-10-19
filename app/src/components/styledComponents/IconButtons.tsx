import { JSXElementConstructor } from 'react'
import styles, { spacing } from '../styles'
import { breakpoints } from '../nativeBaseSpec'
import { Button, useStyleSheet, Icon, IconElement } from '@ui-kitten/components'
import themedStyles from 'themeStyled'
import { ReactElement } from 'react'

const styleS = useStyleSheet(themedStyles)

interface IProps {
  text: string
  onPress: VoidFunction
  isDisabled?: boolean
  leftIcon?: (props: any) => IconElement
  status: string
}

export const IconGrayButton = (props: IProps) => {
  const { text, onPress, isDisabled, leftIcon, status } = props
  return (
    <Button
      style={[styleS.fontBold, styleS.colorCoolGray800, styleS.fontSizeMd]}
      status={status}
      accessoryLeft={leftIcon}
      onPress={onPress}
    >
      {text}
    </Button>
  )
}
