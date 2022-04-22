import React from 'react'
import { Button } from 'native-base'
import { IButtonGroupProps } from 'native-base/lib/typescript/components/primitives/Button'
import _ from 'lodash'

export default function ButtonGroup<T>({
  selected,
  options,
  onPress,
  colorScheme = 'blue',
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
  justifyContent?: string
} & Partial<IButtonGroupProps>) {
  return (
    <Button.Group
      isAttached
      size="md"
      colorScheme={colorScheme}
      flex={fullwidth ? 1 : undefined}
      w={fullwidth ? '100%' : '30%'}
      justifyContent={justifyContent}
      isDisabled={isDisabled}
      {...props}
    >
      {_.map(options, (v: T, k: string) => {
        return (
          <Button
            key={k}
            isDisabled={isDisabled}
            flex={fullwidth ? 1 : undefined}
            _text={{ bold: true }}
            maxW={maxW}
            onPress={() => onPress(v)}
            variant={selected === v ? undefined : 'outline'}
            px={5}
            accessibilityLabel={'button ' + k}
          >
            {k}
          </Button>
        )
      })}
    </Button.Group>
  )
}
