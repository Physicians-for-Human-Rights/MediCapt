import React from 'react'
import { HStack, Text, CheckIcon, CloseIcon } from 'native-base'
import _ from 'lodash'

export default function NecessaryItem({
  todoText,
  doneText,
  size = 4,
  mx = 4,
  isDone,
}: {
  todoText: string
  doneText: string
  size?: number | string
  mx?: number | string
  isDone: boolean
}) {
  if (isDone) {
    return (
      <HStack alignItems="center">
        <CheckIcon size={size} mx={mx} color="emerald.500" />
        <Text>{doneText}</Text>
      </HStack>
    )
  } else {
    return (
      <HStack alignItems="center">
        <CloseIcon size={size} mx={mx} color="error.500" />
        <Text color="error.500">{todoText}</Text>
      </HStack>
    )
  }
}
