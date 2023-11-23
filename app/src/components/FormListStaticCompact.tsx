import React from 'react'
import { ScrollView, Pressable } from 'react-native'
import { Text, useStyleSheet } from '@ui-kitten/components'
import themedStyles from '../themeStyled'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import _ from 'lodash'
import { FormMetadata } from 'utils/types/formMetadata'
import { Dimensions, View } from 'react-native'
import { breakpoints } from './nativeBaseSpec'
import styles, { layout, spacing } from './styles'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md

export function ListItem({
  item,
  selectItem,
}: {
  item: FormMetadata
  selectItem: (i: FormMetadata) => any
}) {
  const styleS = useStyleSheet(themedStyles)
  return (
    <Pressable p={2} onPress={() => selectItem(item)}>
      <View style={[layout.hStack, layout.width100percent, layout.spaceBet]}>
        <View
          style={[layout.hStackGap4, layout.alignCenter, layout.width70percent]}
        >
          <View style={layout.vStack}>
            <Text
              style={[
                styleS.truncated,
                styleS.fontBold,
                styleS.fontSizeSm,
                styleS.colorCoolGray900,
              ]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.pl3,
                styleS.fontSizeSm,
                styleS.colorCoolGray900,
              ]}
            >
              {item.subtitle}
            </Text>
          </View>
        </View>
        <View style={[layout.vStack, layout.width30percent]} w="30%">
          <Text
            style={[
              styleS.truncated,
              styleS.fontSizeSm,
              styleS.colorCoolGray900,
            ]}
          >
            {formatDate(item.createdDate, 'PPP') as string}
          </Text>
          <Text
            style={[
              styleS.truncated,
              styleS.fontSizeSm,
              styleS.colorCoolGray900,
            ]}
          >
            {item.formID}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

export function ListItemDesktop({
  item,
  selectItem,
}: {
  item: FormMetadata
  selectItem: (i: FormMetadata) => any
}) {
  const styleS = useStyleSheet(themedStyles)
  return (
    <Pressable
      style={[spacing.px2, layout.flex1]}
      // _hover={{ bg: 'coolGray.100' }}
      onPress={() => selectItem(item)}
    >
      <View
        style={[
          layout.hStack,
          layout.flex1,
          layout.alignCenter,
          layout.spaceBet,
        ]}
      >
        <View style={[layout.vStack, layout.width100percent]}>
          <Text style={[styleS.fontBold, styleS.truncated]}>{item.title}</Text>
          <Text style={[styleS.ml2, styleS.truncated]}>{item.subtitle}</Text>
          <Text style={[styleS.ml2, styleS.truncated]}>{item.formID}</Text>
        </View>
      </View>
    </Pressable>
  )
}

export default function FormListStaticCompact({
  forms,
  selectItem,
}: {
  forms: FormMetadata[]
  selectItem: (f: FormMetadata) => any
}) {
  return (
    <>
      <View
        style={[
          styles.formListVStack,
          isWider ? styles.formListVStackMd : styles.formListVStackBase,
        ]}
      >
        <View>
          <ScrollView>
            <View
              style={{
                position: 'relative',
                display: width > breakpoints.md ? 'none' : 'flex',
              }}
            >
              {forms.map((item: FormMetadata, index: number) => {
                return (
                  <ListItem item={item} key={index} selectItem={selectItem} />
                )
              })}
            </View>
            <View style={{ display: width > breakpoints.md ? 'flex' : 'none' }}>
              <View style={[layout.vStackGap3, spacing.mt3]}>
                {forms.map((item: FormMetadata, index: number) => {
                  return (
                    <ListItemDesktop
                      item={item}
                      key={index}
                      selectItem={selectItem}
                    />
                  )
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </>
  )
}
