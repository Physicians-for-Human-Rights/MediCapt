import React, { useState, useEffect } from 'react'
import {
  Box,
  HStack,
  Text,
  VStack,
  ScrollView,
  Pressable,
  Stack,
  Center,
  Button,
  Icon,
  Select,
} from 'native-base'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { UserType } from 'utils/types/user'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { Share } from 'utils/types/share'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import SelectLocation from 'components/SelectLocation'
import AnyCountry from 'components/AnyCountry'
import Language from 'components/Language'
import { Platform } from 'react-native'
import { getUserByUUIDCachedAnyPool } from 'api/common'
import { userFullName } from 'utils/userTypes'

export function ListItem({
  item,
  selectItem,
  users,
}: {
  item: Share
  selectItem: (i: Share) => any
  users: Record<string, Partial<UserType>>
}) {
  return (
    <Pressable p={2} onPress={() => selectItem(item)}>
      <HStack justifyContent="space-between" w="100%">
        <HStack alignItems="center" space={4} w="70%">
          <VStack>
            <Text
              isTruncated
              bold
              fontSize="sm"
              _light={{ color: 'coolGray.900' }}
            >
              {item.title}
            </Text>
            <Text
              pl={3}
              isTruncated
              fontSize="sm"
              _light={{ color: 'coolGray.900' }}
            >
              {item.subtitle}
            </Text>
          </VStack>
        </HStack>
        <VStack w="30%">
          <Text isTruncated fontSize="sm" _light={{ color: 'coolGray.900' }}>
            {formatDate(item.createdDate, 'PPP')}
          </Text>
          <Text isTruncated fontSize="sm" _light={{ color: 'coolGray.900' }}>
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
  users,
}: {
  item: Share
  selectItem: (i: Share) => any
  users: Record<string, Partial<UserType>>
}) {
  return (
    <Pressable
      px={2}
      flex={1}
      _hover={{ bg: 'coolGray.100' }}
      onPress={() => selectItem(item)}
    >
      <HStack alignItems="center" flex={1} justifyContent="space-between">
        <VStack w="45%">
          <Text bold isTruncated>
            {item.patientName || t('record.missing-patient-name')}
          </Text>
          <Text isTruncated ml={2}>
            {item.patientGender ? t('gender.' + item.patientGender) : ''}
          </Text>
          <Text isTruncated ml={2}>
            {item.patientAddress ? item.patientAddress : ''}
          </Text>
          <Text isTruncated ml={2}>
            {formatDate(item.patientDateOfBirth, 'PPP')}
          </Text>
          <Text>{item.recordID}</Text>
        </VStack>
        <VStack w="30%">
          <Text>{item.formUUID ? item.formTitle : 'Unknown form'}</Text>
          <Text>{item.formOfficialName + ' ' + item.formOfficialCode}</Text>
          <Text>{item.formID}</Text>
          <Text>{item.caseId ? item.caseId : ''}</Text>
          {_.split(item.formTags, ',').map((s: string, n: number) => (
            <Text isTruncated key={n}>
              {t('tag.' + s)}
            </Text>
          ))}
          <Text>
            {userFullName(users[item.createdByUUID], item.createdByUUID)}
          </Text>
        </VStack>
        <VStack w="20%">
          <Text isTruncated>Record creation</Text>
          <Text isTruncated ml={2}>
            {formatDate(item.recordCreatedDate, 'PPP')}
          </Text>
          <Text isTruncated>Share creation</Text>
          <Text isTruncated ml={2}>
            {formatDate(item.lastChangedDate, 'PPP')}
          </Text>
          <Text isTruncated>Share expiration</Text>
          <Text isTruncated ml={2}>
            {formatDate(item.shareExpiresOn, 'PPP')}
          </Text>
        </VStack>
      </HStack>
    </Pressable>
  )
}

export default function ShareList({
  shares,
  hasMore = false,
  loadMore,
  filterLocationID,
  setFilterLocationID,
  filterEnabled,
  setFilterEnabled,
  filterSearchType,
  setFilterSearchType,
  filterText,
  setFilterText,
  doSearch,
  selectItem,
}: {
  shares: Share[]
  hasMore: boolean
  loadMore?: () => any
  filterLocationID: string
  setFilterLocationID: React.Dispatch<React.SetStateAction<string>>
  filterSearchType: string
  setFilterSearchType: React.Dispatch<React.SetStateAction<string>>
  filterEnabled?: string | undefined
  setFilterEnabled?: React.Dispatch<React.SetStateAction<string>> | undefined
  filterText: string | undefined
  setFilterText: React.Dispatch<React.SetStateAction<string | undefined>>
  doSearch: () => any
  selectItem: (f: Share) => any
}) {
  const [users, setUsers] = useState({} as Record<string, Partial<UserType>>)

  useEffect(() => {
    async function usersFn() {
      const loadedUsers = {} as Record<string, Partial<UserType>>
      await Promise.all(
        _.map(
          _.uniq(
            _.concat(
              _.map(shares, r => r.createdByUUID),
              _.map(shares, r => r.lastChangedByUUID),
              _.map(shares, r => r.sharedWithUUID)
            )
          ),
          async userUUID => {
            const result = await getUserByUUIDCachedAnyPool(
              userUUID,
              () => null
            )
            if (result) loadedUsers[userUUID] = result
            return result
          }
        )
      )
      setUsers(loadedUsers)
    }
    usersFn()
  }, [shares])

  return (
    <>
      <Stack
        direction={{ md: 'row', base: 'column' }}
        mb={{ md: 1, base: 0 }}
        justifyContent="center"
      >
        <Center>
          <SelectLocation
            bg="white"
            placeholder={t('user.enter-location')}
            any={'user.any-location'}
            value={filterLocationID}
            setValue={(id, _uuid) => setFilterLocationID(id)}
            mx={Platform.OS === 'android' ? 0 : { md: 2, base: 0 }}
            my={Platform.OS === 'android' ? 1 : { md: 0, base: 2 }}
            w={Platform.OS === 'android' ? '80%' : undefined}
          />
        </Center>
        {setFilterEnabled && (
          <Center>
            <Select
              size="md"
              bg="white"
              selectedValue={filterEnabled}
              onValueChange={setFilterEnabled}
              placeholder={t('form.filter.select-form-enabled')}
              ml={{ base: 0, md: 2 }}
            >
              <Select.Item
                key={'__any__'}
                label={t('form.filter.any-is-form-enabled')}
                value={''}
              />
              {['enabled', 'disabled'].map(e => (
                <Select.Item key={e} label={t('form.filter.' + e)} value={e} />
              ))}
            </Select>
          </Center>
        )}
      </Stack>
      <HStack py={2} w="100%" justifyContent="center" bg={'muted.50'}>
        <DebouncedTextInput
          flex={{ md: undefined, lg: undefined, base: 1 }}
          w={{ md: '80%', lg: '80%', base: '50%' }}
          py={3}
          mx={{ base: 2, md: 0 }}
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
          placeholder={t('user.search.form-names-and-tags')}
          debounceMs={1000}
          value={filterText}
          onChangeText={setFilterText}
        />
        <Button
          onPress={() => {
            setFilterCountry('')
            setFilterLanguage('')
            setFilterLocationID('')
            setFilterSearchType('')
            setFilterText('')
          }}
          leftIcon={<Icon as={MaterialIcons} name="close" />}
          size="sm"
          mr={2}
        />
        <Button
          onPress={doSearch}
          leftIcon={<Icon as={MaterialIcons} name="refresh" />}
          size="sm"
          mr={2}
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
              {shares.map((item: Share, index: number) => {
                return (
                  <ListItem
                    item={item}
                    key={index}
                    selectItem={selectItem}
                    users={users}
                  />
                )
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
                  w="45%"
                  mb={3}
                  _light={{ color: 'coolGray.800' }}
                >
                  Record
                </Text>
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="30%"
                  mb={3}
                  _light={{ color: 'coolGray.900' }}
                >
                  Form
                </Text>
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="20%"
                  mb={3}
                  _light={{ color: 'coolGray.900' }}
                >
                  Dates
                </Text>
              </HStack>
              <VStack mt={3} space={3}>
                {shares.map((item: Share, index: number) => {
                  return (
                    <ListItemDesktop
                      item={item}
                      key={index}
                      selectItem={selectItem}
                      users={users}
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
