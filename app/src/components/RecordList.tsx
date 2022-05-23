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
// @ts-ignore Record some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { RecordMetadata } from 'utils/types/recordMetadata'
import { FormMetadata } from 'utils/types/formMetadata'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import SelectLocation from 'components/SelectLocation'
import { getFormCached, getUserByUUIDCached } from 'api/common'
import { UserType } from 'utils/types/user'
import { UserPoolId, userFullName } from 'utils/userTypes'

export function ListItem({
  item,
  selectItem,
  forms,
  users,
}: {
  item: RecordMetadata
  selectItem: (i: RecordMetadata) => any
  forms: Record<string, FormMetadata>
  users: Record<string, Partial<UserType>>
}) {
  return (
    <Pressable
      p={2}
      flex={1}
      _hover={{ bg: 'coolGray.100' }}
      onPress={() => selectItem(item)}
    >
      <HStack justifyContent="space-between" w="100%">
        <HStack alignItems="center" space={4} w="70%">
          <VStack>
            <Text
              isTruncated
              bold
              fontSize="sm"
              _light={{ color: 'coolGray.900' }}
            >
              {item.patientName || t('record.missing-patient-name')}
            </Text>
            <Text
              pl={3}
              isTruncated
              fontSize="sm"
              _light={{ color: 'coolGray.900' }}
            >
              {item.patientGender ? t(item.patientGender) : ''}
              {item.patientAge ? t(item.patientAge) : ''}
            </Text>
            <Text
              pl={3}
              isTruncated
              fontSize="sm"
              _light={{ color: 'coolGray.900' }}
            >
              {forms[item.formUUID]
                ? forms[item.formUUID].title
                : 'Unknown form'}
            </Text>
            {forms[item.formUUID]
              ? _.filter(
                  _.split(forms[item.formUUID].tags, ','),
                  e => e !== ''
                ).map((s: string, n: number) => (
                  <Text isTruncated key={n} pl={3}>
                    {t('tag.' + s)}
                  </Text>
                ))
              : ''}
          </VStack>
        </HStack>
        <VStack w="30%">
          <Text isTruncated fontSize="sm" _light={{ color: 'coolGray.900' }}>
            {formatDate(item.lastChangedDate, 'PPP')}
          </Text>
          <Text isTruncated>
            {userFullName(
              users[item.lastChangedByUUID],
              item.lastChangedByUUID
            )}
          </Text>
          <Text>{item.caseId ? item.caseId : ''}</Text>
          <Text isTruncated fontSize="sm" _light={{ color: 'coolGray.900' }}>
            {item.recordID}
          </Text>
        </VStack>
      </HStack>
    </Pressable>
  )
}

export function ListItemDesktop({
  item,
  selectItem,
  forms,
  users,
}: {
  item: RecordMetadata
  selectItem: (i: RecordMetadata) => any
  forms: Record<string, FormMetadata>
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
            {item.patientGender ? t(item.patientGender) : ''}
            {item.patientAge ? t(item.patientAge) : ''}
          </Text>
          <Text>{item.recordID}</Text>
        </VStack>

        <VStack w="20%">
          {forms && forms[item.formUUID]
            ? _.filter(
                _.split(forms[item.formUUID].tags, ','),
                e => e !== ''
              ).map((s: string, n: number) => (
                <Text isTruncated key={n}>
                  {t('tag.' + s)}
                </Text>
              ))
            : ''}
          <Text>
            {forms[item.formUUID] ? forms[item.formUUID].title : 'Unknown form'}
          </Text>
          <Text>{item.formID}</Text>
          <Text>{item.caseId ? item.caseId : ''}</Text>
        </VStack>

        <VStack w="20%">
          <Text isTruncated>{formatDate(item.lastChangedDate, 'PPP')}</Text>
          <Text isTruncated>
            {userFullName(
              users[item.lastChangedByUUID],
              item.lastChangedByUUID
            )}
          </Text>
          <Text isTruncated>{formatDate(item.createdDate, 'PPP')}</Text>
          <Text isTruncated>
            {userFullName(users[item.createdByUUID], item.createdByUUID)}
          </Text>
        </VStack>

        <HStack w="5%">
          {item.sealed ? (
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

export default function RecordList({
  records,
  hasMore = false,
  loadMore,
  filterLocationID,
  setFilterLocationID,
  filterSealed,
  setFilterSealed,
  filterSearchType,
  setFilterSearchType,
  filterText,
  setFilterText,
  doSearch,
  selectItem,
}: {
  records: RecordMetadata[]
  hasMore: boolean
  loadMore?: () => any
  itemsPerPage?: number
  filterLocationID: string
  setFilterLocationID: React.Dispatch<React.SetStateAction<string>>
  filterSearchType: string
  setFilterSearchType: React.Dispatch<React.SetStateAction<string>>
  filterSealed?: string | undefined
  setFilterSealed?: React.Dispatch<React.SetStateAction<string>> | undefined
  filterText: string | undefined
  setFilterText: React.Dispatch<React.SetStateAction<string | undefined>>
  doSearch: () => any
  selectItem: (f: RecordMetadata) => any
}) {
  const [forms, setForms] = useState({} as Record<string, FormMetadata>)
  const [users, setUsers] = useState({} as Record<string, Partial<UserType>>)

  useEffect(() => {
    async function recordsFn() {
      const loadedForms = {} as Record<string, FormMetadata>
      await Promise.all(
        _.map(_.uniq(_.map(records, r => r.formUUID)), async formUUID => {
          const result = await getFormCached(formUUID, () => null)
          if (result) loadedForms[formUUID] = result.metadata
          return result
        })
      )
      setForms(loadedForms)
    }
    async function usersFn() {
      const loadedUsers = {} as Record<string, Partial<UserType>>
      await Promise.all(
        _.map(
          _.uniq(
            _.concat(
              _.map(records, r => r.createdByUUID),
              _.map(records, r => r.lastChangedByUUID)
            )
          ),
          async userUUID => {
            const result = await getUserByUUIDCached(
              'Provider',
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
    recordsFn()
    usersFn()
  }, [records])

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
            setValue={setFilterLocationID}
            mx={{ md: 2, base: 0 }}
            my={{ md: 0, base: 2 }}
          />
        </Center>
        {setFilterSealed && (
          <Center>
            <Select
              size="md"
              bg="white"
              selectedValue={filterSealed}
              onValueChange={setFilterSealed}
              placeholder={t('record.filter.select-record-sealed')}
              ml={{ base: 0, md: 2 }}
            >
              <Select.Item
                key={'__any__'}
                label={t('record.filter.any-is-sealed')}
                value={''}
              />
              {['enabled', 'disabled'].map(e => (
                <Select.Item
                  key={e}
                  label={t('record.filter.' + e)}
                  value={e}
                />
              ))}
            </Select>
          </Center>
        )}
      </Stack>
      <HStack py={2} w="100%" justifyContent="center" bg={'muted.50'}>
        <Center>
          <Select
            size="md"
            bg="white"
            selectedValue={filterSearchType}
            onValueChange={setFilterSearchType}
            placeholder={t('record.search-by.select')}
            ml={{ base: 0, md: 2 }}
            w={{ md: '80%', lg: '80%', base: '80%' }}
          >
            {['record-id', 'patient-name'].map(e => (
              <Select.Item
                key={e}
                label={t('record.search-by.' + e)}
                value={e}
              />
            ))}
          </Select>
        </Center>
        <DebouncedTextInput
          flex={{ md: undefined, lg: undefined, base: 1 }}
          w={{ md: '50%', lg: '50%', base: '30%' }}
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
              {records.map((item: RecordMetadata, index: number) => {
                return (
                  <ListItem
                    item={item}
                    key={index}
                    selectItem={selectItem}
                    forms={forms}
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
                  w="50%"
                  mb={3}
                  _light={{ color: 'coolGray.800' }}
                >
                  {t('record.heading.patient')}
                </Text>
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="23%"
                  mb={3}
                  _light={{ color: 'coolGray.900' }}
                >
                  {t('record.heading.form')}
                </Text>
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="23%"
                  mb={3}
                  _light={{ color: 'coolGray.900' }}
                >
                  {t('record.heading.changed-created')}
                </Text>
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="8%"
                  mb={3}
                  _light={{ color: 'coolGray.900' }}
                  mr={-1}
                >
                  {t('record.heading.sealed')}
                </Text>
              </HStack>
              <VStack mt={3} space={3}>
                {records.map((item: RecordMetadata, index: number) => {
                  return (
                    <ListItemDesktop
                      item={item}
                      key={index}
                      selectItem={selectItem}
                      forms={forms}
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
