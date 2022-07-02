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
import { userFullName } from 'utils/userTypes'
import { Platform } from 'react-native'

export function ListItemMobile({
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
            {item.patientGender ? (
              <Text
                pl={3}
                isTruncated
                fontSize="sm"
                _light={{ color: 'coolGray.900' }}
              >
                {t('gender.' + item.patientGender)}
              </Text>
            ) : (
              <></>
            )}
            {item.patientDateOfBirth > new Date('January 01 1500') ? (
              <Text
                pl={3}
                isTruncated
                fontSize="sm"
                _light={{ color: 'coolGray.900' }}
              >
                {formatDate(item.patientDateOfBirth, 'PPP')}
              </Text>
            ) : (
              <></>
            )}
            {item.patientAddress ? (
              <Text
                pl={3}
                isTruncated
                fontSize="sm"
                _light={{ color: 'coolGray.900' }}
              >
                {item.patientAddress}
              </Text>
            ) : (
              <></>
            )}
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
            {forms[item.formUUID] ? (
              _.filter(
                _.split(forms[item.formUUID].tags, ','),
                e => e !== ''
              ).map((s: string, n: number) => (
                <Text isTruncated key={n} pl={3}>
                  {t('tag.' + s)}
                </Text>
              ))
            ) : (
              <Text></Text>
            )}
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
          <Text isTruncated fontSize="sm" _light={{ color: 'coolGray.900' }}>
            {item.recordID}
          </Text>
          {item.caseId ? <Text>item.caseId</Text> : <></>}
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
          <Text>
            {forms[item.formUUID] ? forms[item.formUUID].title : 'Unknown form'}
          </Text>
          <Text>{item.recordID}</Text>
        </VStack>

        <VStack w="20%">
          <Text>
            {forms[item.formUUID]
              ? forms[item.formUUID]['official-name'] +
                ' ' +
                forms[item.formUUID]['official-code']
              : 'Unknown form'}
          </Text>
          <Text>{item.caseId ? item.caseId : ''}</Text>
          <Text>{item.formID}</Text>
        </VStack>

        <VStack w="20%">
          <Text isTruncated>{formatDate(item.lastChangedDate, 'PPP')}</Text>
          <Text isTruncated>
            {userFullName(
              users[item.lastChangedByUUID],
              item.lastChangedByUUID
            )}
          </Text>
        </VStack>

        <VStack w="5%">
          {item.sealed ? (
            <Icon color="success.400" size="6" name="star" as={AntDesign} />
          ) : (
            <Icon color="error.700" size="6" name="staro" as={AntDesign} />
          )}
        </VStack>
      </HStack>
    </Pressable>
  )
}

export default function RecordListStaticComponent({
  records,
  selectItem,
}: {
  records: RecordMetadata[]
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
                <ListItemMobile
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
  )
}
