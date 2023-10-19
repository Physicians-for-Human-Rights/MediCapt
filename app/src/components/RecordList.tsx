import React, { useState, useEffect } from 'react'
import {
  HStack,
  VStack,
  ScrollView,
  Pressable,
  Stack,
  Center,
  Icon,
  Select,
} from 'native-base'
import { Text, useStyleSheet, Button } from '@ui-kitten/components'
import themedStyles from 'themeStyled'
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
import { Platform, View, Dimensions } from 'react-native'
import { breakpoints } from './nativeBaseSpec'
import { CloseIcon, RefreshIcon } from './Icons'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md
const styleS = useStyleSheet(themedStyles)

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
              style={[
                styleS.truncated,
                styleS.fontBold,
                styleS.fontSizeSm,
                styleS.colorCoolGray900,
              ]}
            >
              {item.patientName || t('record.missing-patient-name')}
            </Text>
            {item.patientGender ? (
              <Text
                style={[
                  styleS.truncated,
                  styleS.pl3,
                  styleS.fontSizeSm,
                  styleS.colorCoolGray900,
                ]}
              >
                {t('gender.' + item.patientGender)}
              </Text>
            ) : (
              <></>
            )}
            {item.patientDateOfBirth > new Date('January 01 1500') ? (
              <Text
                style={[
                  styleS.truncated,
                  styleS.pl3,
                  styleS.fontSizeSm,
                  styleS.colorCoolGray900,
                ]}
              >
                {formatDate(item.patientDateOfBirth, 'PPP') as string}
              </Text>
            ) : (
              <></>
            )}
            {item.patientAddress ? (
              <Text
                style={[
                  styleS.truncated,
                  styleS.pl3,
                  styleS.fontSizeSm,
                  styleS.colorCoolGray900,
                ]}
              >
                {item.patientAddress}
              </Text>
            ) : (
              <></>
            )}
            <Text
              style={[
                styleS.truncated,
                styleS.pl3,
                styleS.fontSizeSm,
                styleS.colorCoolGray900,
              ]}
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
                <Text style={[styleS.truncated, styleS.pl3]} key={n}>
                  {t('tag.' + s)}
                </Text>
              ))
            ) : (
              <Text></Text>
            )}
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
            {formatDate(item.lastChangedDate, 'PPP') as string}
          </Text>
          <Text style={[styleS.truncated]}>
            {userFullName(
              users[item.lastChangedByUUID],
              item.lastChangedByUUID
            )}
          </Text>
          <Text
            style={[
              styleS.truncated,
              styleS.fontSizeSm,
              styleS.colorCoolGray900,
            ]}
          >
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
          <Text style={[styleS.truncated, styleS.fontBold]}>
            {item.patientName || t('record.missing-patient-name')}
          </Text>
          <Text style={[styleS.truncated, styleS.ml2]}>
            {item.patientGender ? t('gender.' + item.patientGender) : ''}
          </Text>
          <Text style={[styleS.truncated, styleS.ml2]}>
            {item.patientDateOfBirth > new Date('January 01 1500')
              ? (formatDate(item.patientDateOfBirth, 'PPP') as string)
              : ''}
          </Text>
          <Text style={[styleS.truncated, styleS.ml2]}>
            {item.patientAddress ? item.patientAddress : ''}
          </Text>
          <Text>{item.recordID}</Text>
        </VStack>

        <VStack w="20%">
          {forms && forms[item.formUUID] ? (
            _.filter(
              _.split(forms[item.formUUID].tags, ','),
              e => e !== ''
            ).map((s: string, n: number) => (
              <Text style={[styleS.truncated]} key={n}>
                {t('tag.' + s)}
              </Text>
            ))
          ) : (
            <Text></Text>
          )}
          <Text>
            {forms[item.formUUID] ? forms[item.formUUID].title : 'Unknown form'}
          </Text>
          <Text>
            {forms[item.formUUID]
              ? forms[item.formUUID]['official-name'] +
                ' ' +
                forms[item.formUUID]['official-code']
              : 'Unknown form'}
          </Text>
          <Text>{item.formID}</Text>
          <Text>{item.caseId ? item.caseId : ''}</Text>
        </VStack>

        <VStack w="20%">
          <Text style={[styleS.truncated]}>
            {formatDate(item.lastChangedDate, 'PPP') as string}
          </Text>
          <Text style={[styleS.truncated]}>
            {userFullName(
              users[item.lastChangedByUUID],
              item.lastChangedByUUID
            )}
          </Text>
          <Text style={[styleS.truncated]}>
            {formatDate(item.createdDate, 'PPP') as string}
          </Text>
          <Text style={[styleS.truncated]}>
            {userFullName(users[item.createdByUUID], item.createdByUUID)}
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

export default function RecordList({
  records,
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
  filter,
}: {
  records: RecordMetadata[]
  hasMore: boolean
  loadMore?: () => any
  itemsPerPage?: number
  filterLocationID: string
  setFilterLocationID: React.Dispatch<React.SetStateAction<string>>
  filterSealed?: string | undefined
  setFilterSealed?: React.Dispatch<React.SetStateAction<string>> | undefined
  filterSearchType: string
  setFilterSearchType: React.Dispatch<React.SetStateAction<string>>
  filterText: string | undefined
  setFilterText: React.Dispatch<React.SetStateAction<string | undefined>>
  doSearch: () => any
  selectItem: (r: RecordMetadata) => any
  filter: (r: RecordMetadata) => boolean
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
            setValue={(id, _uuid) => setFilterLocationID(id)}
            mx={Platform.OS === 'android' ? 0 : { md: 2, base: 0 }}
            my={Platform.OS === 'android' ? 2 : { md: 0, base: 2 }}
            w={Platform.OS === 'android' ? '80%' : undefined}
          />
        </Center>
        {setFilterSealed ? (
          <Center>
            <Select
              size="md"
              bg="white"
              selectedValue={filterSealed}
              onValueChange={setFilterSealed}
              placeholder={t('record.filter.select-record-sealed')}
              ml={Platform.OS === 'android' ? 0 : { base: 0, md: 2 }}
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
        ) : (
          <></>
        )}
      </Stack>
      <Stack
        direction={{ md: 'row', base: 'column' }}
        pt={0}
        pb={2}
        space={2}
        w="100%"
        justifyContent="center"
        bg={'muted.50'}
      >
        <Center>
          <Select
            size="md"
            bg="white"
            selectedValue={filterSearchType}
            onValueChange={setFilterSearchType}
            placeholder={t('record.search-by.select')}
            // TODO props causing crashes on Android
            ml={Platform.OS === 'android' ? 0 : { base: 0, md: 2 }}
            w={Platform.OS === 'android' ? '90%' : '100%'}
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
        <HStack justifyContent="center">
          <DebouncedTextInput
            flex={{ md: undefined, lg: undefined, base: 1 }}
            w={
              Platform.OS === 'android'
                ? '97%'
                : { md: '50%', lg: '50%', base: '97%' }
            }
            py={0}
            ml={Platform.OS === 'android' ? 2 : { base: 2, md: 4 }}
            mr={
              Platform.OS === 'android' ? 2 : { base: 4, md: 4, lg: 5, xl: 10 }
            }
            bg="white"
            minH={10}
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
      </Stack>
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
              {_.filter(records, filter).map(
                (item: RecordMetadata, index: number) => {
                  return (
                    <ListItemMobile
                      item={item}
                      key={index}
                      selectItem={selectItem}
                      forms={forms}
                      users={users}
                    />
                  )
                }
              )}
            </View>
            <View style={{ display: isWider ? 'flex' : 'none' }}>
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
                    styleS.width50Percent,
                    styleS.mb3,
                    styleS.colorCoolGray800,
                  ]}
                >
                  {t('record.heading.patient')}
                </Text>
                <Text
                  style={[
                    styleS.fontBold,
                    styleS.textLeft,
                    styleS.width23Percent,
                    styleS.mb3,
                    styleS.colorCoolGray900,
                  ]}
                >
                  {t('record.heading.form')}
                </Text>
                <Text
                  style={[
                    styleS.fontBold,
                    styleS.textLeft,
                    styleS.width23Percent,
                    styleS.mb3,
                    styleS.colorCoolGray900,
                  ]}
                >
                  {t('record.heading.changed-created')}
                </Text>
                <Text
                  style={[
                    styleS.fontBold,
                    styleS.textLeft,
                    styleS.width8Percent,
                    styleS.mb3,
                    styleS.colorCoolGray900,
                    styleS.mrMinus1,
                  ]}
                >
                  {t('record.heading.sealed')}
                </Text>
              </HStack>
              <VStack mt={3} space={3}>
                {_.filter(records, filter).map(
                  (item: RecordMetadata, index: number) => {
                    return (
                      <ListItemDesktop
                        item={item}
                        key={index}
                        selectItem={selectItem}
                        forms={forms}
                        users={users}
                      />
                    )
                  }
                )}
              </VStack>
            </View>
          </ScrollView>
        </View>
      </VStack>
    </>
  )
}
