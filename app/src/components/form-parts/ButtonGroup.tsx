import React from 'react'
import { Button } from 'native-base'
import _ from 'lodash'

export default function ButtonGroup<T>({
  selected,
  options,
  onPress,
  colorScheme = 'blue',
  maxW = '30%',
  ...props
}: {
  selected: T | null
  options: Record<string, T>
  onPress: (arg: T) => any
  colorScheme?: string
  maxW?: string
}) {
  return (
    <Button.Group
      isAttached
      w="100%"
      size="md"
      colorScheme={colorScheme}
      flex={1}
      justifyContent="center"
      {...props}
    >
      {_.map(options, (v: T, k: string) => {
        return (
          <Button
            key={k}
            flex={1}
            _text={{ bold: true }}
            maxW={maxW}
            onPress={() => onPress(v)}
            variant={selected === v ? undefined : 'outline'}
          >
            {k}
          </Button>
        )
      })}
    </Button.Group>
  )
}
