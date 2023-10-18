import React from 'react'
import { VStack, HStack, Icon, Text, IconButton } from 'native-base'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import { View, StyleSheet } from 'react-native'
import { colors } from './nativeBaseSpec'

const FormTop = ({
  sectionOffset,
  currentSection,
  isMenuVisible,
  toggleMenu,
  title,
  lastSection,
  isSectionCompleted,
  overrideTitle,
}: {
  sectionOffset: (n: number) => any
  currentSection: number
  isMenuVisible: boolean
  toggleMenu: () => any
  title: string
  lastSection: number
  isSectionCompleted: boolean
  overrideTitle?: string
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isSectionCompleted
            ? colors.success[500]
            : colors.primary[800],
        },
      ]}
      px="1"
      bg={isSectionCompleted ? 'success.600' : 'primary.800'}
      borderColor="coolGray.200"
    >
      <HStack space="3" justifyContent="space-between" pr="4">
        <HStack
          py="4"
          pl="2"
          space="1"
          justifyContent="space-between"
          alignItems="center"
        >
          <IconButton
            bg="info.500"
            onPress={toggleMenu}
            icon={
              <Icon
                size="6"
                name={isMenuVisible ? 'close' : 'menu'}
                as={MaterialCommunityIcons}
                color="coolGray.50"
              />
            }
          />
        </HStack>
        <HStack pt="4" pb="4" space="1" justifyContent="space-between">
          <IconButton
            _disabled={{ bg: 'white' }}
            _hover={{ bg: 'white' }}
            bg={currentSection !== 0 ? 'info.500' : 'trueGray.500'}
            disabled={currentSection === 0}
            onPress={() => sectionOffset(-1)}
            icon={
              <Icon
                size="6"
                as={AntDesign}
                name="arrowleft"
                color={currentSection !== 0 ? 'coolGray.50' : 'trueGray.300'}
              />
            }
          />
        </HStack>
        <VStack flex="3" justifyContent="center" alignItems="center">
          <Text
            color="coolGray.50"
            fontSize="lg"
            isTruncated
            maxW={56}
            selectable={false}
          >
            Section {currentSection + 1}
          </Text>
          <Text
            color="coolGray.50"
            fontSize="lg"
            isTruncated
            selectable={false}
          >
            {title}
          </Text>
        </VStack>
        <HStack pt="4" pb="4" space="1" justifyContent="space-between">
          <IconButton
            _disabled={{ bg: 'white' }}
            _hover={{ bg: 'white' }}
            bg={currentSection !== lastSection ? 'info.500' : 'trueGray.500'}
            disabled={currentSection === lastSection}
            onPress={() => sectionOffset(1)}
            icon={
              <Icon
                size="6"
                as={AntDesign}
                name="arrowright"
                color={currentSection !== 0 ? 'coolGray.50' : 'trueGray.300'}
              />
            }
          />
        </HStack>
      </HStack>
    </View>
  )
}

export default React.memo(FormTop)

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    borderColor: colors.coolGray[200],
  },
})
