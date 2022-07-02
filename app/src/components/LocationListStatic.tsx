import React, { useState } from 'react'
import {
  Box,
  HStack,
  Stack,
  Center,
  Text,
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
import { LocationType } from 'utils/types/location'
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons'
import { Platform } from 'react-native'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'

export function ListItem({ item }: { item: LocationType }) {
  return (
    <Pressable p={2} borderBottomWidth={0.8} borderBottomColor="coolGray.300">
      <HStack justifyContent="space-between" w="100%">
        <HStack alignItems="center" space={4} w="55%">
          <VStack>
            <Text
              isTruncated
              bold
              fontSize="sm"
              noOfLines={2}
              maxW="64"
              color="coolGray.900"
            >
              {item.legalName}
            </Text>
            <HStack>
              <Text pl={3} isTruncated fontSize="sm" color="coolGray.600">
                {t('location.entity.' + item.entityType)}
              </Text>
              <Text isTruncated ml={2} color="coolGray.600">
                {t('country.' + item.country)}
              </Text>
            </HStack>
            <Text pl={3} isTruncated fontSize="sm" color="coolGray.700">
              {formatDate(item.lastChangedDate, 'PPP')}
            </Text>
          </VStack>
        </HStack>
        <HStack alignItems="center" space={4} w="32%">
          <VStack>
            <Text isTruncated maxW="100%" fontSize="xs" color="coolGray.900">
              {item.shortName}
            </Text>
            <Text isTruncated maxW="100%" fontSize="xs" color="coolGray.900">
              {item.locationID}
            </Text>
            <Text isTruncated maxW="100%" fontSize="xs" color="coolGray.500">
              {formatDate(item.createdDate, 'PPP')}
            </Text>
            <Text isTruncated fontSize="xs" maxW="60%" color="coolGray.500">
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
          <Text bold isTruncated noOfLines={2}>
            {_.isString(item) ? item : item.legalName}
          </Text>
          {!_.isString(item) && (
            <HStack alignItems="center" flex={1} justifyContent="flex-start">
              <Text isTruncated ml={2}>
                {item.shortName}
              </Text>
            </HStack>
          )}
          {!_.isString(item) && (
            <Text isTruncated ml={2}>
              {t('location.entity.' + item.entityType)}
            </Text>
          )}
        </VStack>

        <VStack w="20%">
          {!_.isString(item) && (
            <Text isTruncated>{t('country.' + item.country)}</Text>
          )}
          {!_.isString(item) && (
            <Text isTruncated>{t('languages.' + item.language)}</Text>
          )}
        </VStack>

        <VStack w="30%">
          {!_.isString(item) && (
            <Text isTruncated>{formatDate(item.lastChangedDate, 'PPP')}</Text>
          )}
          {!_.isString(item) && <Text isTruncated>{item.locationID}</Text>}
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
