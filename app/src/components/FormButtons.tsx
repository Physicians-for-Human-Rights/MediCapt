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
  VStack,
} from 'native-base'
import { AntDesign, Feather } from '@expo/vector-icons'
import _ from 'lodash'

export default function FormButtons({
  isSectionCompleteList,
  onExit,
  onSaveAndExit,
  onCompleteRecord,
  onPrint,
  onAddRecord,
  onUpgrade,
  changed,
}: {
  isSectionCompleteList: boolean[]
  onExit: () => any
  onSaveAndExit: () => any
  onCompleteRecord: () => any
  onPrint: () => any
  onAddRecord?: () => any
  onUpgrade?: () => any
  changed: boolean
}) {
  const stackDirection = useBreakpointValue({
    base: 'column',
    sm: 'row',
  })
  return (
    <VStack>
      {onAddRecord && onUpgrade ? (
        <Stack
          pt="3"
          direction={stackDirection}
          space="2"
          justifyContent="center"
          bg="white"
          key="header1"
        >
          <Button
            bg="info.500"
            leftIcon={<Icon as={Feather} name="plus-square" size="sm" />}
            onPress={onAddRecord}
            _text={{ selectable: false }}
          >
            Add associated record
          </Button>
          <Button
            leftIcon={<Icon as={Feather} name="alert-triangle" size="sm" />}
            bg="error.500"
            onPress={onUpgrade}
            _text={{ selectable: false }}
          >
            Upgrade form version
          </Button>
        </Stack>
      ) : (
        <></>
      )}
      <Stack
        py="3"
        direction={stackDirection}
        space="2"
        justifyContent="center"
        bg="white"
        key="header2"
      >
        {changed ? (
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
              leftIcon={<Icon as={AntDesign} name="close" size="sm" />}
              bg="info.500"
              onPress={onExit}
              _text={{ selectable: false }}
            >
              Cancel
            </Button>
          </HStack>
        ) : (
          <Button
            leftIcon={<Icon as={Feather} name="arrow-left" size="sm" />}
            bg="info.500"
            onPress={onExit}
            _text={{ selectable: false }}
          >
            Exit
          </Button>
        )}
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
    </VStack>
  )
}
