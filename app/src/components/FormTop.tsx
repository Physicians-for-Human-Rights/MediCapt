import React from 'react'
import { VStack, HStack } from 'native-base'
import { View, StyleSheet } from 'react-native'
import { colors } from './nativeBaseSpec'
import { Text, Icon, Button, useStyleSheet } from '@ui-kitten/components'
import { spacing } from './styles'

import themedStyles from 'themeStyled'

const styleS = useStyleSheet(themedStyles)

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
        spacing.px1,
        { borderColor: colors.coolGray[200] },
      ]}
      // bg={isSectionCompleted ? 'success.600' : 'primary.800'}
    >
      <HStack space="3" justifyContent="space-between" pr="4">
        <HStack
          py="4"
          pl="2"
          space="1"
          justifyContent="space-between"
          alignItems="center"
        >
          <Button
            status="info"
            onPress={toggleMenu}
            accessoryLeft={
              <Icon
                size="6"
                name={isMenuVisible ? 'close' : 'menu'}
                pack="material"
                fill={colors.coolGray[50]}
                // color="coolGray.50"
              />
            }
          />
        </HStack>
        <HStack pt="4" pb="4" space="1" justifyContent="space-between">
          <Button
            // _disabled={{ bg: 'white' }}
            // _hover={{ bg: 'white' }}
            status={currentSection !== 0 ? 'info' : 'blueGray'}
            disabled={currentSection === 0}
            onPress={() => sectionOffset(-1)}
            accessoryLeft={
              <Icon
                size="6"
                pack="material"
                name="keyboard_backspace"
                // fill={currentSection !== 0 ? 'coolGray.50' : 'trueGray.300'}
                fill={
                  currentSection !== 0
                    ? colors.coolGray[100]
                    : colors.coolGray[300]
                }
              />
            }
          />
        </HStack>
        <VStack flex="3" justifyContent="center" alignItems="center">
          <Text
            style={[
              styleS.colorCoolGray50,
              styleS.fontSizeLg,
              styleS.truncated,
              { maxWidth: 56 },
            ]}
            // selectable={false}
          >
            Section {currentSection + 1}
          </Text>
          <Text
            style={[
              styleS.colorCoolGray50,
              styleS.fontSizeLg,
              styleS.truncated,
            ]}
            // selectable={false}
          >
            {title}
          </Text>
        </VStack>
        <HStack pt="4" pb="4" space="1" justifyContent="space-between">
          <Button
            // _disabled={{ bg: 'white' }}
            // _hover={{ bg: 'white' }}
            status={currentSection !== lastSection ? 'info' : 'blueGray'}
            // bg={currentSection !== lastSection ? 'info.500' : 'trueGray.500'}
            disabled={currentSection === lastSection}
            onPress={() => sectionOffset(1)}
            accessoryLeft={
              <Icon
                size="6"
                // as={AntDesign}
                pack="material"
                name="keyboard_backspace"
                fill={
                  currentSection !== 0
                    ? colors.coolGray[50]
                    : colors.coolGray[300]
                }
                // color={currentSection !== 0 ? 'coolGray.50' : 'trueGray.300'}
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
