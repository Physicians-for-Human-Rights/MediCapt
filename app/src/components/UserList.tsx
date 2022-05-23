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
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { UserType } from 'utils/types/user'
import { UserKindList } from 'utils/userTypes'
import AnyCountry from 'components/AnyCountry'
import Language from 'components/Language'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'

export function ListItem({ item }: { item: UserType }) {
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
                {t('user.user.' + item.userType)}
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
              {item.userID}
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
  item: UserType
  selectItem: (user: UserType) => any
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
            {item.name}
          </Text>
          <HStack alignItems="center" flex={1} justifyContent="flex-start">
            <Text isTruncated ml={2}>
              {item.nickname}
            </Text>
          </HStack>
        </VStack>

        <VStack w="20%">
          <Text isTruncated>{item.email}</Text>
          <Text isTruncated>{item.username}</Text>
        </VStack>

        <VStack w="30%">
          <Text isTruncated>{formatDate(item.last_updated_time, 'PPP')}</Text>
          <Text isTruncated>{item.userID}</Text>
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

export default function UserList({
  users,
  hasMore = false,
  loadMore,
  filterUserType,
  setFilterUserType,
  filterEnabledOrDisabled,
  setFilterEnabledOrDisabled,
  filterLocation,
  setFilterLocation,
  filterSearchType,
  setFilterSearchType,
  filterText,
  setFilterText,
  doSearch,
  selectItem,
}: {
  users: UserType[]
  hasMore: boolean
  loadMore?: () => any
  filterUserType: string
  setFilterUserType: React.Dispatch<React.SetStateAction<string>>
  filterEnabledOrDisabled: string
  setFilterEnabledOrDisabled: React.Dispatch<React.SetStateAction<string>>
  filterLocation: string
  setFilterLocation: React.Dispatch<React.SetStateAction<string>>
  filterSearchType: string
  setFilterSearchType: React.Dispatch<React.SetStateAction<string>>
  filterText: string | undefined
  setFilterText: React.Dispatch<React.SetStateAction<string | undefined>>
  doSearch: () => any
  selectItem: (user: UserType) => any
}) {
  return (
    <>
      <Stack
        direction={{ md: 'row', base: 'column' }}
        mb={{ md: 1, base: 0 }}
        justifyContent="center"
      >
        <Center>
          <Select
            size="md"
            bg="white"
            selectedValue={filterUserType}
            onValueChange={setFilterUserType}
            placeholder={t('user.select-user-type')}
          >
            {UserKindList.map(e => (
              <Select.Item key={e} label={t('user.' + e)} value={e} />
            ))}
          </Select>
        </Center>
        <Center>
          <Select
            size="md"
            bg="white"
            selectedValue={filterEnabledOrDisabled}
            onValueChange={setFilterEnabledOrDisabled}
            placeholder={t('user.filter.select-user-enabled')}
            ml={{ base: 0, md: 2 }}
          >
            <Select.Item
              key={'__any__'}
              label={t('user.filter.any-is-user-enabled')}
              value={''}
            />
            {['enabled', 'disabled'].map(e => (
              <Select.Item key={e} label={t('user.filter.' + e)} value={e} />
            ))}
          </Select>
        </Center>
        <Center>
          <DebouncedTextInput
            flex={{ md: undefined, lg: undefined, base: 1 }}
            w={{ md: '90%', lg: '90%', base: '90%' }}
            py={3}
            ml={{ base: 0, md: 2 }}
            bg="white"
            size="lg"
            color="black"
            placeholder={t('user.enter-location')}
            debounceMs={1000}
            value={filterLocation}
            onChangeText={setFilterLocation}
          />
        </Center>
        <HStack
          my={{ md: 0, base: 2 }}
          mb={{ md: 1, base: 2 }}
          justifyContent="center"
        >
          <Button
            onPress={() => {
              setFilterUserType('Manager')
              setFilterEnabledOrDisabled('')
              setFilterLocation('')
              setFilterSearchType('')
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
        <Center>
          <Select
            size="md"
            bg="white"
            selectedValue={filterSearchType}
            onValueChange={setFilterSearchType}
            placeholder={t('user.search-by.select')}
            ml={{ base: 0, md: 2 }}
            w={{ md: '80%', lg: '80%', base: '80%' }}
          >
            {['username', 'email', 'phone-number', 'name', 'user-id-code'].map(
              e => (
                <Select.Item
                  key={e}
                  label={t('user.search-by.' + e)}
                  value={e}
                />
              )
            )}
          </Select>
        </Center>
        <DebouncedTextInput
          flex={{ md: undefined, lg: undefined, base: 1 }}
          w={{ md: '70%', lg: '70%', base: '70%' }}
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
          placeholder={t('user.search-enter')}
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
              {users.map((item: UserType, index: number) => {
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
                  {t('heading.usernameAndEmail')}
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
                {users.map((item: UserType, index: number) => {
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
