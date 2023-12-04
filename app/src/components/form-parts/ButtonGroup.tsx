import React from 'react'
// import { IButtonGroupProps } from 'native-base/lib/typescript/components/primitives/Button'
import _ from 'lodash'
import { Text, ButtonGroup as ButtonGroupKitten } from '@ui-kitten/components'
import { Pressable } from 'react-native'
import { colors } from '../nativeBaseSpec'

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
      style={{
        flex: fullwidth ? 1 : undefined,
        justifyContent: justifyContent || 'flex-end',
        width: fullwidth ? '100%' : '30%',
      }}
    >
      {_.map(options, (v: T, k: string) => {
        return (
          <Pressable
            key={k}
            disabled={isDisabled}
            // style={{
            //   flex: fullwidth ? 1 : undefined,
            //   maxWidth: maxW,
            //   paddingHorizontal: 20,
            // }}
            onPress={() => onPress(v)}
            aria-label={'button ' + k}
            style={[
              baseStyle,
              selected === v ? selectedStyle : unseledtedStyle,
            ]}
          >
            <Text style={selected === v ? selectedText : unselectedText}>
              {k}
            </Text>
          </Pressable>
        )
      })}
    </ButtonGroupKitten>
  )
}
const baseStyle = {
  paddingHorizontal: 10,
  paddingVertical: 8,
  fontWeight: 600,
}
const unseledtedStyle = {
  backgroundColor: 'white',
  // color: colors.primary[500] + ' !important',
  border: `1px solid ${colors.primary[500]}`,
  color: colors.primary[500],
}
const selectedStyle = {
  backgroundColor: colors.primary[500],
  color: 'white',
}
const selectedText = {
  color: 'white',
}
const unselectedText = {
  fontWeight: 600,
  colors: colors.primary[500],
}
