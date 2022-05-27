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
} from 'native-base'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { Platform } from 'react-native'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { LocationType, locationEntityTypes } from 'utils/types/location'
import AnyCountry from 'components/AnyCountry'
import Language from 'components/Language'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'

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
  item: LocationType
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
            {item.legalName}
          </Text>
          <HStack alignItems="center" flex={1} justifyContent="flex-start">
            <Text isTruncated ml={2}>
              {item.shortName}
            </Text>
          </HStack>
          <Text isTruncated ml={2}>
            {t('location.entity.' + item.entityType)}
          </Text>
        </VStack>

        <VStack w="20%">
          <Text isTruncated>{t('country.' + item.country)}</Text>
          <Text isTruncated>{t('languages.' + item.language)}</Text>
        </VStack>

        <VStack w="30%">
          <Text isTruncated>{formatDate(item.lastChangedDate, 'PPP')}</Text>
          <Text isTruncated>{item.locationID}</Text>
        </VStack>

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

export default function LocationList({
  locations,
  hasMore = false,
  loadMore,
  filterCountry,
  setFilterCountry,
  filterLanguage,
  setFilterLanguage,
  filterEntityType,
  setFilterEntityType,
  filterText,
  setFilterText,
  doSearch,
  selectItem,
}: {
  locations: LocationType[]
  hasMore: boolean
  loadMore?: () => any
  filterCountry: string
  setFilterCountry: React.Dispatch<React.SetStateAction<string>>
  filterLanguage: string
  setFilterLanguage: React.Dispatch<React.SetStateAction<string>>
  filterEntityType: string
  setFilterEntityType: React.Dispatch<React.SetStateAction<string>>
  filterText: string | undefined
  setFilterText: React.Dispatch<React.SetStateAction<string | undefined>>
  doSearch: () => any
  selectItem: (location: LocationType) => any
}) {
  return (
    <>
      <Stack
        direction={{ md: 'row', base: 'column' }}
        mb={{ md: 1, base: 0 }}
        justifyContent="center"
      >
        <Center>
          <AnyCountry
            bg="white"
            placeholder={t('location.select-country')}
            value={filterCountry}
            setValue={setFilterCountry}
            any={'location.any-country'}
            mt={Platform.OS === 'android' ? 2 : { md: 0, base: 2 }}
            w={Platform.OS === 'android' ? '80%' : undefined}
          />
        </Center>
        <Center>
          <Language
            bg="white"
            placeholder={t('location.select-language')}
            value={filterLanguage}
            setValue={setFilterLanguage}
            any={'location.any-language'}
            mx={Platform.OS === 'android' ? 0 : { md: 2, base: 0 }}
            my={Platform.OS === 'android' ? 2 : { md: 0, base: 2 }}
            w={Platform.OS === 'android' ? '80%' : undefined}
          />
        </Center>
        <Center>
          <Select
            size="md"
            bg="white"
            selectedValue={filterEntityType}
            onValueChange={setFilterEntityType}
            placeholder={t('location.select-entity-type')}
          >
            <Select.Item
              key={'__any__'}
              label={t('location.any-entity-type')}
              value={''}
            />
            {locationEntityTypes.map(e => (
              <Select.Item
                key={e}
                label={t('location.entity.' + e)}
                value={e}
              />
            ))}
          </Select>
        </Center>
        <HStack
          my={{ md: 0, base: 2 }}
          mb={{ md: 1, base: 2 }}
          justifyContent="center"
        >
          <Button
            onPress={() => {
              setFilterCountry('')
              setFilterLanguage('')
              setFilterEntityType('')
              setFilterText('')
            }}
            leftIcon={<Icon as={MaterialIcons} name="close" />}
            size="sm"
            ml={4}
            mr={2}
          />
          <Button
            onPress={doSearch}
            leftIcon={<Icon as={MaterialIcons} name="refresh" />}
            size="sm"
          />
        </HStack>
      </Stack>
      <HStack py={2} w="100%" justifyContent="center" bg={'muted.50'}>
        <DebouncedTextInput
          flex={{ md: undefined, lg: undefined, base: 1 }}
          w={{ md: '90%', lg: '90%', base: '80%' }}
          py={3}
          mx={{ base: 4, md: 0 }}
          mr={{ base: 4, md: 4, lg: 5, xl: 10 }}
          bg="white"
          InputLeftElement={
            <Icon
              as={<AntDesign name="search1" />}
              size={{ base: '4', md: '4' }}
              my={2}
              ml={2}
              _light={{
                color: 'coolGray.400',
              }}
            />
          }
          size="lg"
          color="black"
          placeholder={t('location.search')}
          debounceMs={1000}
          value={filterText}
          onChangeText={setFilterText}
        />
      </HStack>
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
          <ScrollView>
            <Box position="relative" display={{ md: 'none', base: 'flex' }}>
              {locations.map((item: LocationType, index: number) => {
                return <ListItem item={item} key={index} />
              })}
            </Box>
            <Box display={{ md: 'flex', base: 'none' }}>
              <HStack
                alignItems="center"
                justifyContent="space-between"
                borderBottomWidth={1}
                _light={{ borderColor: 'coolGray.200' }}
              >
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="30%"
                  ml={1}
                  mb={3}
                  _light={{ color: 'coolGray.800' }}
                >
                  {t('heading.name')}
                </Text>
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="20%"
                  mb={3}
                  _light={{ color: 'coolGray.900' }}
                >
                  {t('heading.countryAndLanguage')}
                </Text>
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="25%"
                  mb={3}
                  _light={{ color: 'coolGray.900' }}
                >
                  {t('heading.lastChangedAndId')}
                </Text>
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="10%"
                  mb={3}
                  _light={{ color: 'coolGray.900' }}
                  mr={-1}
                >
                  {t('heading.enabled')}
                </Text>
              </HStack>
              <VStack mt={3} space={3}>
                {locations.map((item: LocationType, index: number) => {
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
