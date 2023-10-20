import React, { useState, useEffect } from 'react'
import {
  HStack,
  VStack,
  ScrollView,
  Pressable,
  Stack,
  Center,
  Select,
} from 'native-base'
import { Button, Text, useStyleSheet, Icon } from '@ui-kitten/components'
import themedStyles from 'themeStyled'
import { UserType } from 'utils/types/user'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { Share } from 'utils/types/share'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import SelectLocation from 'components/SelectLocation'
import { Dimensions, Platform, View } from 'react-native'
import { getUserByUUIDCachedAnyPool } from 'api/common'
import { userFullName } from 'utils/userTypes'
import { breakpoints } from './nativeBaseSpec'
import { CloseIcon, RefreshIcon } from './Icons'
import { colors } from './nativeBaseSpec'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md
const styleS = useStyleSheet(themedStyles)

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
          <Text style={[styleS.fontBold, styleS.truncated]}>
            {item.patientName || t('record.missing-patient-name')}
          </Text>
          <Text style={[styleS.ml2, styleS.truncated]}>
            {item.patientGender ? t('gender.' + item.patientGender) : ''}
          </Text>
          <Text style={[styleS.ml2, styleS.truncated]}>
            {item.patientAddress ? item.patientAddress : ''}
          </Text>
          <Text style={[styleS.ml2, styleS.truncated]}>
            {formatDate(item.patientDateOfBirth, 'PPP') as string}
          </Text>
          <Text>{item.recordID}</Text>
        </VStack>
        <VStack w="30%">
          <Text>{item.formUUID ? item.formTitle : 'Unknown form'}</Text>
          <Text>{item.formOfficialName + ' ' + item.formOfficialCode}</Text>
          <Text>{item.formID}</Text>
          <Text>{item.caseId ? item.caseId : ''}</Text>
          {_.split(item.formTags, ',').map((s: string, n: number) => (
            <Text style={[styleS.truncated]} key={n}>
              {t('tag.' + s)}
            </Text>
          ))}
          <Text>
            {userFullName(users[item.createdByUUID], item.createdByUUID)}
          </Text>
        </VStack>
        <VStack w="20%">
          <Text style={[styleS.truncated]}>Record creation</Text>
          <Text style={[styleS.truncated, styleS.ml2]}>
            {formatDate(item.recordCreatedDate, 'PPP') as string}
          </Text>
          <Text style={[styleS.truncated]}>Share creation</Text>
          <Text style={[styleS.truncated, styleS.ml2]}>
            {formatDate(item.lastChangedDate, 'PPP') as string}
          </Text>
          <Text style={[styleS.truncated]}>Share expiration</Text>
          <Text style={[styleS.truncated, styleS.ml2]}>
            {formatDate(item.shareExpiresOn, 'PPP') as string}
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
              pack="material"
              size="tiny"
              name="search"
              fill={colors.coolGray[400]}
              style={[styleS.my2, styleS.ml2]}
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
          accessoryLeft={CloseIcon}
          size="sm"
          style={[styleS.mr2]}
        />
        <Button
          onPress={doSearch}
          accessoryLeft={RefreshIcon}
          size="sm"
          style={[styleS.mr2]}
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
        <View>
          <ScrollView>
            <View
              style={{
                position: 'relative',
                display: isWider ? 'none' : 'flex',
              }}
            >
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
            </View>
            <View
              style={{
                display: isWider ? 'none' : 'flex',
              }}
            >
              <HStack
                alignItems="center"
                justifyContent="space-between"
                borderBottomWidth={1}
                _light={{ borderColor: 'coolGray.200' }}
              >
                <Text
                  style={[
                    styleS.fontBold,
                    styleS.textLeft,
                    styleS.width45Percent,
                    styleS.colorCoolGray800,
                    styleS.mb3,
                  ]}
                >
                  Record
                </Text>
                <Text
                  style={[
                    styleS.fontBold,
                    styleS.textLeft,
                    styleS.width30Percent,
                    styleS.colorCoolGray900,
                    styleS.mb3,
                  ]}
                >
                  Form
                </Text>
                <Text
                  style={[
                    styleS.fontBold,
                    styleS.textLeft,
                    styleS.width20Percent,
                    styleS.colorCoolGray900,
                    styleS.mb3,
                  ]}
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
            </View>
          </ScrollView>
        </View>
      </VStack>
    </>
  )
}
