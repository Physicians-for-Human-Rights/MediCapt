import React from 'react'
import { Button } from 'native-base'
import _ from 'lodash'

export default function ButtonGroup<T>({
  selected,
  options,
  onPress,
  colorScheme = 'blue',
  maxW = '30%',
  fullwidth = true,
  ...props
}: {
  selected: T | null
  options: Record<string, T>
  onPress: (arg: T) => any
  colorScheme?: string
  maxW?: string
  fullwidth?: boolean
}) {
  return (
    <Button.Group
      isAttached
      size="md"
      colorScheme={colorScheme}
      flex={fullwidth ? 1 : undefined}
      w={fullwidth ? '100%' : '20%'}
      justifyContent="center"
      {...props}
    >
      {_.map(options, (v: T, k: string) => {
        return (
          <Button
            key={k}
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
