import React from 'react'
import {
  Box,
  HStack,
  Pressable,
  Icon,
  Text,
  Button,
  Badge,
  useBreakpointValue,
  FlatList,
  Stack,
} from 'native-base'
import { AntDesign } from '@expo/vector-icons'
import _ from 'lodash'

export default function FormButtons({
  isSectionCompleteList,
  onCancel,
  onSaveAndExit,
  onCompleteRecord,
  onPrint,
}: {
  isSectionCompleteList: boolean[]
  onCancel: () => any
  onSaveAndExit: () => any
  onCompleteRecord: () => any
  onPrint: () => any
}) {
  const stackDirection = useBreakpointValue({
    base: 'column',
    sm: 'row',
  })
  return (
    <Stack
      py="3"
      direction={stackDirection}
      space="2"
      justifyContent="center"
      bg="white"
      key="header"
    >
      <HStack space="2" justifyContent="center">
        <Button
          bg="info.500"
          leftIcon={<Icon as={AntDesign} name="printer" size="sm" />}
          onPress={onPrint}
          _text={{ selectable: false }}
        >
          Print
        </Button>
        <Button
          leftIcon={<Icon as={AntDesign} name="close" size="sm" />}
          bg="info.500"
          onPress={onCancel}
          _text={{ selectable: false }}
        >
          Cancel
        </Button>
      </HStack>
      <HStack space="2" justifyContent="center">
        <Button
          bg="info.500"
          leftIcon={<Icon as={AntDesign} name="save" size="sm" />}
          onPress={onSaveAndExit}
          _text={{ selectable: false }}
        >
          Save and Exit
        </Button>
        <Button
          bg={
            _.every(isSectionCompleteList, (a: boolean) => a)
              ? 'success.600'
              : 'primary.800'
          }
          leftIcon={<Icon as={AntDesign} name="staro" size="sm" />}
          onPress={onCompleteRecord}
          _text={{ selectable: false }}
        >
          Complete record
        </Button>
      </HStack>
    </Stack>
  )
}
