import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors } from './nativeBaseSpec'
import { Text, Icon, Button, useStyleSheet } from '@ui-kitten/components'
import { spacing, layout } from './styles'
import i18n from 'i18n'

import themedStyles from '../themeStyled'

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
  const styleS = useStyleSheet(themedStyles)
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
      <View style={[layout.hStackGap3, layout.spaceBet, spacing.pr4]}>
        <View
          style={[
            layout.hStackGap1,
            layout.alignCenter,
            layout.spaceBet,
            spacing.py4,
            spacing.pl2,
          ]}
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
        </View>
        <View style={[layout.hStackGap1, spacing.py4, layout.spaceBet]}>
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
                name="west"
                // fill={currentSection !== 0 ? 'coolGray.50' : 'trueGray.300'}
                fill={
                  currentSection !== 0
                    ? colors.coolGray[100]
                    : colors.coolGray[300]
                }
              />
            }
          />
        </View>
        <View style={[layout.vStack, layout.justifyCenter, layout.flex3]}>
          <Text
            style={[
              styleS.colorCoolGray50,
              styleS.fontSizeLg,
              styleS.truncated,
              { maxWidth: 56 },
            ]}
            // selectable={false}
          >
            {i18n.t('general.section') + currentSection + 1}
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
        </View>
        <View style={[layout.hStackGap1, layout.spaceBet, spacing.py4]}>
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
                name="west"
                fill={
                  currentSection !== 0
                    ? colors.coolGray[50]
                    : colors.coolGray[300]
                }
                // color={currentSection !== 0 ? 'coolGray.50' : 'trueGray.300'}
              />
            }
          />
        </View>
      </View>
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
