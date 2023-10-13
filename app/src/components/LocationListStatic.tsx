import React, { useState } from 'react'
import {
  Box,
  HStack,
  Stack,
  Center,
  VStack,
  ScrollView,
  Pressable,
  Input,
  IconButton,
  Icon,
  Button,
  Select,
  Heading,
} from 'native-base'
import { Text, useStyleSheet } from '@ui-kitten/components'
import themedStyles from 'themeStyled'
import { LocationType } from 'utils/types/location'
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons'
import { Platform } from 'react-native'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'

const styleS = useStyleSheet(themedStyles)

export function ListItem({ item }: { item: LocationType }) {
  return (
    <Pressable p={2} borderBottomWidth={0.8} borderBottomColor="coolGray.300">
      <HStack justifyContent="space-between" w="100%">
        <HStack alignItems="center" space={4} w="55%">
          <VStack>
            <Text
              style={[
                styleS.truncated,
                styleS.fontBold,
                styleS.fontSizeSm,
                styleS.maxWidth64x4,
                styleS.colorCoolGray900,
              ]}
              numberOfLines={2}
            >
              {item.legalName}
            </Text>
            <HStack>
              <Text
                style={[
                  styleS.truncated,
                  styleS.fontSizeSm,
                  styleS.pl3,
                  styleS.colorCoolGray600,
                ]}
              >
                {t('location.entity.' + item.entityType)}
              </Text>
              <Text
                style={[styleS.truncated, styleS.ml2, styleS.colorCoolGray600]}
              >
                {t('country.' + item.country)}
              </Text>
            </HStack>
            <Text
              style={[
                styleS.truncated,
                styleS.pl3,
                styleS.colorCoolGray700,
                styleS.fontSizeSm,
              ]}
            >
              {formatDate(item.lastChangedDate, 'PPP') as string}
            </Text>
          </VStack>
        </HStack>
        <HStack alignItems="center" space={4} w="32%">
          <VStack>
            <Text
              style={[
                styleS.truncated,
                styleS.maxWidth100Percent,
                styleS.colorCoolGray900,
                styleS.fontSizeXs,
              ]}
            >
              {item.shortName}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.maxWidth100Percent,
                styleS.fontSizeXs,
                styleS.colorCoolGray900,
              ]}
            >
              {item.locationID}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.maxWidth100Percent,
                styleS.fontSizeXs,
                styleS.colorCoolGray500,
              ]}
            >
              {formatDate(item.createdDate, 'PPP') as string}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.maxWidth60Percent,
                styleS.fontSizeXs,
                styleS.colorCoolGray500,
              ]}
            >
              {item.enabled}
            </Text>
          </VStack>
        </HStack>
        <HStack w="5%">
          {item.enabled ? (
            <Icon
              color="success.400"
              size="6"
              name="check-circle"
              as={MaterialIcons}
            />
          ) : (
            <Icon color="error.700" size="6" name="cancel" as={MaterialIcons} />
          )}
        </HStack>
      </HStack>
    </Pressable>
  )
}

export function ListItemDesktop({
  item,
  selectItem,
}: {
  item: LocationType | string
  selectItem: (location: LocationType) => any
}) {
  return (
    <Pressable
      px={2}
      flex={1}
      _hover={{ bg: 'coolGray.100' }}
      onPress={() => selectItem(item)}
    >
      <HStack alignItems="center" flex={1} justifyContent="space-between">
        <VStack w="30%">
          <Text style={[styleS.fontBold, styleS.truncated]} numberOfLines={2}>
            {_.isString(item) ? item : item.legalName}
          </Text>
          {!_.isString(item) && (
            <HStack alignItems="center" flex={1} justifyContent="flex-start">
              <Text style={[styleS.ml2, styleS.truncated]}>
                {item.shortName}
              </Text>
            </HStack>
          )}
          {!_.isString(item) && (
            <Text style={[styleS.ml2, styleS.truncated]}>
              {t('location.entity.' + item.entityType)}
            </Text>
          )}
        </VStack>

        <VStack w="20%">
          {!_.isString(item) && (
            <Text style={[styleS.truncated]}>
              {t('country.' + item.country)}
            </Text>
          )}
          {!_.isString(item) && (
            <Text style={[styleS.truncated]}>
              {t('languages.' + item.language)}
            </Text>
          )}
        </VStack>

        <VStack w="30%">
          {!_.isString(item) && (
            <Text style={[styleS.truncated]}>
              {formatDate(item.lastChangedDate, 'PPP') as string}
            </Text>
          )}
          {!_.isString(item) && (
            <Text style={[styleS.truncated]}>{item.locationID}</Text>
          )}
        </VStack>

        <HStack w="5%">
          <Icon color="red.400" size="6" name="trash-2" as={Feather} />
        </HStack>
      </HStack>
    </Pressable>
  )
}

export default function LocationListStatic({
  locations,
  selectItem,
}: {
  locations: (LocationType | string)[]
  selectItem: (location: LocationType) => any
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
        <Box>
          <Center>
            <Heading size="md">Allowed locations</Heading>
          </Center>
          <ScrollView>
            <Box position="relative" display={{ md: 'none', base: 'flex' }}>
              {locations.map((item: LocationType | string, index: number) => {
                return <ListItem item={item} key={index} />
              })}
            </Box>
            <Box display={{ md: 'flex', base: 'none' }}>
              <VStack mt={3} space={3}>
                {locations.map((item: LocationType | string, index: number) => {
                  return (
                    <ListItemDesktop
                      item={item}
                      key={index}
                      selectItem={selectItem}
                    />
                  )
                })}
              </VStack>
            </Box>
          </ScrollView>
        </Box>
      </VStack>
    </>
  )
}
