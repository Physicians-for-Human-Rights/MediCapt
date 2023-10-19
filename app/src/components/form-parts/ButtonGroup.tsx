import React from 'react'
// import { IButtonGroupProps } from 'native-base/lib/typescript/components/primitives/Button'
import _ from 'lodash'
import {
  Button,
  ButtonGroup as ButtonGroupKitten,
  useStyleSheet,
} from '@ui-kitten/components'
import themedStyles from 'themeStyled'

const styleS = useStyleSheet(themedStyles)

export default function ButtonGroup<T>({
  selected,
  options,
  onPress,
  colorScheme = 'info',
  maxW = '30%',
  fullwidth = true,
  isDisabled = false,
  justifyContent = 'flex-end',
  ...props
}: {
  selected: T | null
  options: Record<string, T>
  onPress: (arg: T) => void
  colorScheme?: string
  maxW?: string
  fullwidth?: boolean
  isDisabled?: boolean
  justifyContent?: any
} & Partial<any>) {
  return (
    <ButtonGroupKitten
      size="medium"
      style={{
        flex: fullwidth ? 1 : undefined,
        justifyContent: justifyContent || 'flex-end',
        width: fullwidth ? '100%' : '30%',
      }}
      status={colorScheme}
      // isDisabled={isDisabled}
      // {...props}
    >
      {_.map(options, (v: T, k: string) => {
        return (
          <Button
            key={k}
            disabled={isDisabled}
            style={{
              flex: fullwidth ? 1 : undefined,
              maxWidth: maxW,
              paddingHorizontal: 20,
            }}
            // _text={{ bold: true }}
            onPress={() => onPress(v)}
            appearance={selected === v ? 'filled' : 'outline'}
            accessibilityLabel={'button ' + k}
          >
            {k}
          </Button>
        )
      })}
    </ButtonGroupKitten>
  )
}
