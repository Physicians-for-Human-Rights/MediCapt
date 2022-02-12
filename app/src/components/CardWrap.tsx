import React from 'react'
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
  useBreakpointValue,
  Heading,
  Checkbox,
} from 'native-base'
import { StyleSheet } from 'react-native'

import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'
import _ from 'lodash'

/* Wraps every collection of elements in a Form. Can be nested. Only renders the
 * contents if the form has updated. */

function CardWrap({
  index,
  title,
  description,
  inner,
  subparts,
  changedPaths,
  formPath,
  keepAlive,
  rawDescription,
  skippable,
  skipped,
  toggleSkip,
}: {
  index: number
  title: string
  description: string
  inner: JSX.Element
  subparts: JSX.Element
  changedPaths: string[]
  formPath: string
  keepAlive: string[]
  rawDescription: string
  skippable: boolean | null
  skipped: boolean
  toggleSkip: () => any
}) {
  // TODO We should compute section completed per card
  // color={isSectionCompleted ? 'success.600' : 'primary.800'}
  return (
    <Box
      key={index}
      rounded="lg"
      borderColor="coolGray.200"
      borderWidth="1"
      mt={4}
      py={2}
      mx={2}
      px={2}
      bg="white"
    >
      <VStack space={2}>
        <Center>
          <Heading size="md">{title}</Heading>
        </Center>
        {description}
        {inner}
        {subparts}
      </VStack>
      {skippable && (
        <Pressable
          position="absolute"
          right="0"
          px="1"
          py="1"
          onPress={toggleSkip}
        >
          <VStack>
            <Center>
              <Checkbox
                value="skip"
                isChecked={skipped}
                style={styles.checkbox}
                size="sm"
                accessibilityLabel="Skip this field"
              />
            </Center>
            <Center>
              <Text fontSize={10}>SKIP</Text>
            </Center>
          </VStack>
        </Pressable>
      )}
    </Box>
  )
}

const RerenderFieldAsNecessary = React.memo(
  CardWrap,
  (prevProps, nextProps) => {
    if (nextProps.noRenderCache) return false
    return (
      prevProps.title === nextProps.title &&
      prevProps.formPath === nextProps.formPath &&
      prevProps.rawDescription === nextProps.rawDescription &&
      !_.some(nextProps.changedPaths, vp =>
        vp.startsWith(nextProps.formPath)
      ) &&
      !_.some(nextProps.keepAlive, vp => vp.startsWith(nextProps.formPath))
    )
  }
)

const styles = StyleSheet.create({
  checkbox: {
    width: 13,
    height: 13,
  },
})

export default RerenderFieldAsNecessary
