import React, { useState } from 'react'
import {
  Box,
  HStack,
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
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { UserType } from 'utils/types/user'
import { LocationType, locationEntityTypes } from 'utils/types/location'
import AnyCountry from 'components/AnyCountry'
import Language from 'components/Language'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'

export function ListItem({ item }: { item: LocationType }) {
  return (
    <Pressable p={2} borderBottomWidth={0.8} borderBottomColor="coolGray.300">
      <HStack justifyContent="space-between" w="100%">
        <HStack alignItems="center" space={4} w="60%">
          <VStack>
            <Text
              isTruncated
              bold
              fontSize="sm"
              noOfLines={2}
              maxW="64"
              color="coolGray.900"
            >
              {item.patientName}
            </Text>
            <HStack>
              <Text pl={3} isTruncated fontSize="sm" color="coolGray.600">
                {item.patientAge}
              </Text>
              <Text isTruncated ml={2} color="coolGray.600">
                {t('gender.' + item.patientGender)}
              </Text>
            </HStack>
            <Text pl={3} isTruncated fontSize="sm" color="coolGray.700">
              {formatDate(item.createdDate || item.lastChangedDate, 'PPP')}
            </Text>
          </VStack>
        </HStack>
        <HStack alignItems="center" space={4} w="40%">
          <VStack>
            <Text isTruncated maxW="60%" fontSize="xs" color="coolGray.900">
              {item.recordID}
            </Text>
            <Text isTruncated maxW="60%" fontSize="xs" color="coolGray.500">
              {item.locationUUID}
            </Text>
            <Text isTruncated fontSize="xs" maxW="60%" color="coolGray.500">
              {item.providerCreatedUUID}
            </Text>
            {_.split(item.formTags, ',').map((s: string, n: number) => (
              <Text isTruncated key={n} fontSize="xs">
                {t('tag.' + s)}
              </Text>
            ))}
          </VStack>
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
  itemsPerPage = 20,
  loadNextPage,
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
  itemsPerPage?: number
  loadNextPage?: (
    pageToken: null | string
  ) => null | { pageToken: string; contents: UserType[] }
  filterCountry: string | undefined
  setFilterCountry: React.Dispatch<React.SetStateAction<string | undefined>>
  filterLanguage: string | undefined
  setFilterLanguage: React.Dispatch<React.SetStateAction<string | undefined>>
  filterEntityType: string | undefined
  setFilterEntityType: React.Dispatch<React.SetStateAction<string | undefined>>
  filterText: string | undefined
  setFilterText: React.Dispatch<React.SetStateAction<string | undefined>>
  doSearch: () => any
  selectItem: (location: LocationType) => any
}) {
  const [page, setPage] = useState(1)
  const [pageToken, setPageToken] = useState(null as null | string)
  const numberOfPages = Math.ceil(locations.length / itemsPerPage)
  return (
    <>
      <HStack
        pt={{ md: 5, base: 2 }}
        w="100%"
        justifyContent="space-between"
        _light={{ bg: { base: 'white', md: 'muted.50' } }}
      >
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
          placeholder="Search for location names, ids, tags, etc."
          debounceMs={200}
          value={filterText}
          onChangeText={setFilterText}
        />
        <Button
          leftIcon={
            <Icon
              as={MaterialIcons}
              name="close"
              size="sm"
              onPress={() => {
                console.log('X', filterText)
                console.log('Y', filterEntityType)
                // @ts-ignore
                setFilterCountry(null)
                // @ts-ignore
                setFilterLanguage(null)
                // @ts-ignore
                setFilterEntityType('')
                // @ts-ignore
                setFilterText('CM')
              }}
            />
          }
          size="xs"
          mr={2}
        />
        <Button
          leftIcon={
            <Icon
              as={MaterialIcons}
              name="refresh"
              size="sm"
              onPress={doSearch}
            />
          }
          size="xs"
        />
      </HStack>
      <HStack mb={{ md: 5, base: 0 }} justifyContent="center">
        <AnyCountry
          bg="white"
          placeholder={t('location.select-country')}
          value={filterCountry}
          setValue={setFilterCountry}
        />
        <Language
          bg="white"
          placeholder={t('location.select-language')}
          value={filterLanguage}
          setValue={setFilterLanguage}
        />
        <Select
          size="md"
          bg="white"
          selectedValue={filterEntityType}
          placeholder={t('location.select-entity-type')}
          onValueChange={setFilterEntityType}
          m={3}
        >
          {locationEntityTypes.map(e => (
            <Select.Item key={e} label={t('location.entity.' + e)} value={e} />
          ))}
        </Select>
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
                {locations.map((item: Location, index: number) => {
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
      {numberOfPages !== 1 && (
        <HStack
          display={{ base: 'none', md: 'flex' }}
          space="2"
          alignItems="center"
          mt="2"
          justifyContent="flex-end"
        >
          {_.range(1, numberOfPages + 1).map((n: number) => (
            <Pressable
              height={8}
              width={8}
              borderRadius={4}
              bg="white"
              color="coolGray.500"
              textAlign="center"
              justifyContent="center"
              borderColor={n === page ? 'primary.700' : undefined}
              borderWidth={n === page ? 1 : undefined}
              onPress={() => setPage(n)}
            >
              <Text color="coolGray.500" fontSize="sm">
                {n}
              </Text>
            </Pressable>
          ))}
        </HStack>
      )}
    </>
  )
}
