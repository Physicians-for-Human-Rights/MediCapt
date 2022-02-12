import React from 'react'
import styles from 'styles'
import {
  Box,
  VStack,
  StatusBar,
  ScrollView,
  HStack,
  Pressable,
  Icon,
  Image,
  Text,
  Hidden,
  useColorMode,
  IconButton,
  Divider,
  Menu,
  Avatar,
  Button,
  Input,
  Center,
  Badge,
  useBreakpointValue,
  FlatList,
} from 'native-base'

import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'

import _ from 'lodash'
import { NamedFormSection, NamedFormPart } from 'utils/formTypesHelpers'

function FormMenu({
  formSections,
  changeSection,
  isSectionCompleteList,
  toggleMenu,
}: {
  formSections: NamedFormSection[]
  changeSection: (i: number) => any
  isSectionCompleteList: boolean[]
  toggleMenu: () => any
}) {
  return (
    <ScrollView scrollsToTop={false} stickyHeaderIndices={[0]}>
      <HStack space="3" py="3" justifyContent="center" pb={4}>
        <Button
          bg="info.500"
          leftIcon={<Icon as={AntDesign} name="printer" size="sm" />}
        >
          Print
        </Button>
        <Button
          bg="info.500"
          leftIcon={<Icon as={AntDesign} name="save" size="sm" />}
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
        >
          Complete record
        </Button>
      </HStack>
      <FlatList
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
                >
                  {item.title}
                </Text>
              </HStack>
            </Box>
          </Pressable>
        )}
        keyExtractor={(_item: NamedFormSection, idx: number) => idx + ''}
      />
    </ScrollView>
  )
}

const RerenderIfNecessary = React.memo(FormMenu, (prevProps, nextProps) => {
  return (
    prevProps.formSections === nextProps.formSections &&
    _.isEqual(prevProps.isSectionCompleteList, nextProps.isSectionCompleteList)
  )
})

export default RerenderIfNecessary
