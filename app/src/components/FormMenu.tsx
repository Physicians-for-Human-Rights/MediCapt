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
import { NamedFormSection } from 'utils/formTypesHelpers'

function FormMenu({
  formSections,
  changeSection,
  isSectionCompleteList,
  toggleMenu,
  onCancel,
  onSaveAndExit,
  onCompleteRecord,
  onPrint,
}: {
  formSections: NamedFormSection[]
  changeSection: (i: number) => any
  isSectionCompleteList: boolean[]
  toggleMenu: () => any
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
    <FlatList
      stickyHeaderIndices={[0]}
      ListHeaderComponent={
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
      }
      data={formSections}
      renderItem={({
        item,
        index,
      }: {
        item: NamedFormSection
        index: number
      }) => (
        <Pressable
          onPress={() => {
            changeSection(index)
            toggleMenu()
          }}
        >
          <Box
            borderBottomWidth="1"
            borderColor="coolGray.200"
            pl="4"
            pr="5"
            py="2"
          >
            <HStack space={3} justifyContent="flex-start">
              <Badge
                px={2}
                colorScheme={isSectionCompleteList[index] ? 'success' : 'red'}
              >
                {index + 1}
              </Badge>
              <Text
                color={
                  isSectionCompleteList[index] ? 'success.600' : 'primary.800'
                }
                selectable={false}
              >
                {item.title}
              </Text>
            </HStack>
          </Box>
        </Pressable>
      )}
      keyExtractor={(_item: NamedFormSection, idx: number) => idx + ''}
    />
  )
}

const RerenderIfNecessary = React.memo(FormMenu, (prevProps, nextProps) => {
  return (
    prevProps.formSections === nextProps.formSections &&
    _.isEqual(prevProps.isSectionCompleteList, nextProps.isSectionCompleteList)
  )
})

export default RerenderIfNecessary
