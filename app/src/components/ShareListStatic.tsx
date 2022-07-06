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
import { UserType } from 'utils/types/user'
import { getUserByUUIDCachedAnyPool } from 'api/common'
import { userFullName, UserKindNames } from 'utils/userTypes'

export function ListItemMobile({
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
        <HStack alignItems="center" space={4} w="60%">
          <VStack>
            <Text
              isTruncated
              bold
              fontSize="sm"
              _light={{ color: 'coolGray.900' }}
            >
              {item.formTitle}
            </Text>
            <Text
              pl={3}
              isTruncated
              fontSize="sm"
              _light={{ color: 'coolGray.900' }}
            >
              {item.formSubtitle}
            </Text>
          </VStack>
        </HStack>
        <HStack alignItems="center" space={4} w="40%">
          <VStack>
            <Text
              isTruncated
              bold
              fontSize="sm"
              _light={{ color: 'coolGray.900' }}
            >
              {item.formTitle}
            </Text>
            <Text
              pl={3}
              isTruncated
              fontSize="sm"
              _light={{ color: 'coolGray.900' }}
            >
              {item.formSubtitle}
            </Text>
          </VStack>
        </HStack>
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
        <VStack w="60%">
          <Text bold isTruncated>
            {userFullName(users[item.sharedWithUUID], item.sharedWithUUID)}
          </Text>
          <Text isTruncated ml={2}>
            {t('user.' + item.sharedWithUUIDUserType)}
          </Text>
          <Text isTruncated ml={2}>
            {users[item.sharedWithUUID]
              ? users[item.sharedWithUUID].phone_number
              : ''}
          </Text>
          <Text isTruncated ml={2}>
            {users[item.sharedWithUUID] ? users[item.sharedWithUUID].email : ''}
          </Text>
          <Text isTruncated ml={2}>
            {users[item.sharedWithUUID]
              ? users[item.sharedWithUUID].address
              : ''}
          </Text>
        </VStack>
        <VStack w="40%">
          <HStack>
            <Text bold isTruncated>
              Shared on
            </Text>
            <Text isTruncated ml={2}>
              {formatDate(item.createdDate, 'PPP')}
            </Text>
          </HStack>
          <HStack>
            <Text bold isTruncated>
              Expires on
            </Text>
            <Text isTruncated ml={2}>
              {formatDate(item.shareExpiresOn, 'PPP')}
            </Text>
          </HStack>
          <Text bold isTruncated>
            Shared by
          </Text>
          <Text isTruncated ml={2}>
            {userFullName(users[item.createdByUUID], item.createdByUUID)}
          </Text>
          <Text isTruncated ml={2}>
            {users[item.sharedWithUUID] ? users[item.sharedWithUUID].email : ''}
          </Text>
        </VStack>
      </HStack>
    </Pressable>
  )
}

export default function ShareListStatic({
  shares,
  selectItem,
}: {
  shares: Share[]
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
                  <ListItemMobile
                    item={item}
                    key={index}
                    selectItem={selectItem}
                    users={users}
                  />
                )
              })}
            </Box>
            <Box display={{ md: 'flex', base: 'none' }}>
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
