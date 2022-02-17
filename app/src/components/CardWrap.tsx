import React from 'react'
import {
  Box,
  VStack,
  Pressable,
  Text,
  Center,
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
import { someSet } from 'utils/set'
import { RecordPath } from 'utils/recordTypes'

const styles = StyleSheet.create({
  checkbox: {
    width: 13,
    height: 13,
  },
})

/* Wraps every collection of elements in a Form. Can be nested. Only renders the
 * contents if the form has updated. */

function CardWrap({
  index,
  title,
  description,
  inner,
  subparts,
  changedPaths,
  recordPath,
  keepAlive,
  rawDescription,
  skippable,
  skipped,
  toggleSkip,
  noRenderCache,
  showBox = null,
}: {
  index: number
  title: string | null
  description: JSX.Element | null
  inner: JSX.Element | null
  subparts: JSX.Element | null
  changedPaths: string[]
  recordPath: RecordPath
  keepAlive: Set<string>
  rawDescription: string | null | undefined
  skippable: boolean | null
  skipped: boolean
  toggleSkip: () => any
  noRenderCache?: boolean | null
  showBox?: boolean | null
}) {
  const size = recordPath.length < 4 ? 'md' : 'sm'
  const fontWeight = recordPath.length < 6 ? 'bold' : 'normal'
  const borderWidth =
    showBox === null || showBox === undefined
      ? recordPath.length < 8
        ? 1
        : 0
      : showBox
      ? 1
      : 0
  const padding = recordPath.length < 8 ? 2 : 0
  // TODO We should compute section completed per card
  // color={isSectionCompleted ? 'success.600' : 'primary.800'}
  return (
    <Box
      key={index}
      rounded="lg"
      borderColor="coolGray.200"
      borderWidth={borderWidth}
      mt={4}
      py={2}
      mx={1}
      px={2}
      bg="white"
    >
      <VStack space={2}>
        <Center>
          <Heading size={size} fontWeight={fontWeight}>
            {title}
          </Heading>
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
    const stingPath = _.join(nextProps.recordPath, '.')
    return (
      prevProps.title === nextProps.title &&
      _.isEqual(prevProps.recordPath, nextProps.recordPath) &&
      prevProps.rawDescription === nextProps.rawDescription &&
      !_.some(nextProps.changedPaths, vp => vp.startsWith(stingPath)) &&
      !someSet<string>(nextProps.keepAlive, vp => vp.startsWith(stingPath))
    )
  }
)

export default RerenderFieldAsNecessary
