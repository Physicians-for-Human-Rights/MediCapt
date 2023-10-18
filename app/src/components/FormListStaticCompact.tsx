import React from 'react'
import { HStack, VStack, ScrollView, Pressable } from 'native-base'
import { Text, useStyleSheet } from '@ui-kitten/components'
import themedStyles from 'themeStyled'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { FormMetadata } from 'utils/types/formMetadata'
import { Dimensions, View } from 'react-native'
import { breakpoints } from './nativeBaseSpec'

const styleS = useStyleSheet(themedStyles)
const { width } = Dimensions.get('window')

export function ListItem({
  item,
  selectItem,
}: {
  item: FormMetadata
  selectItem: (i: FormMetadata) => any
}) {
  return (
    <Pressable p={2} onPress={() => selectItem(item)}>
      <HStack justifyContent="space-between" w="100%">
        <HStack alignItems="center" space={4} w="70%">
          <VStack>
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
          </VStack>
        </HStack>
        <VStack w="30%">
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
        </VStack>
      </HStack>
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
  return (
    <Pressable
      px={2}
      flex={1}
      _hover={{ bg: 'coolGray.100' }}
      onPress={() => selectItem(item)}
    >
      <HStack alignItems="center" flex={1} justifyContent="space-between">
        <VStack w="100%">
          <Text style={[styleS.fontBold, styleS.truncated]}>{item.title}</Text>
          <Text style={[styleS.ml2, styleS.truncated]}>{item.subtitle}</Text>
          <Text style={[styleS.ml2, styleS.truncated]}>{item.formID}</Text>
        </VStack>
      </HStack>
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
      <VStack
        px={{ base: 4, md: 8 }}
        py={{ base: 2, md: 8 }}
        borderRadius={{ md: '8' }}
        _light={{
          borderColor: 'coolGray.200',
          bg: { base: 'white' },
        }}
        borderWidth={{ md: '1' }}
        borderBottomWidth="1"
        space="4"
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
              <VStack mt={3} space={3}>
                {forms.map((item: FormMetadata, index: number) => {
                  return (
                    <ListItemDesktop
                      item={item}
                      key={index}
                      selectItem={selectItem}
                    />
                  )
                })}
              </VStack>
            </View>
          </ScrollView>
        </View>
      </VStack>
    </>
  )
}
