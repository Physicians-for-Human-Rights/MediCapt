import React, { useState, useEffect } from 'react'
import {
  Text,
  useStyleSheet,
  Icon,
  Select,
  SelectItem,
  IndexPath,
} from '@ui-kitten/components'
import themedStyles from '../themeStyled'
// @ts-ignore Record some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import i18n from 'i18n'
import _ from 'lodash'
import { RecordMetadata } from 'utils/types/recordMetadata'
import { FormMetadata } from 'utils/types/formMetadata'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import SelectLocation from 'components/SelectLocation'
import { getFormCached, getUserByUUIDCached } from 'api/common'
import { UserType } from 'utils/types/user'
import { userFullName } from 'utils/userTypes'
import { Platform, View, Dimensions, ScrollView, Pressable } from 'react-native'
import { breakpoints } from './nativeBaseSpec'
import { colors } from './nativeBaseSpec'
import styles, { borders, layout, spacing } from './styles'
import IconButtonLg from './IconButtonLg'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md

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
  const styleS = useStyleSheet(themedStyles)
  return (
    <Pressable
      style={[spacing.p2, layout.flex1]}
      // _hover={{ bg: 'coolGray.100' }}
      onPress={() => selectItem(item)}
    >
      <View style={[layout.hStack, layout.spaceBet, layout.width100percent]}>
        <View
          style={[layout.hStackGap4, layout.alignCenter, layout.width70percent]}
        >
          <View style={[layout.vStack]}>
            <Text
              style={[
                styleS.truncated,
                styleS.fontBold,
                styleS.fontSizeSm,
                styleS.colorCoolGray900,
              ]}
            >
              {item.patientName || i18n.t('record.missing-patient-name')}
            </Text>
            {item.patientGender && (
              <Text
                style={[
                  styleS.truncated,
                  styleS.pl3,
                  styleS.fontSizeSm,
                  styleS.colorCoolGray900,
                ]}
              >
                {i18n.t('gender.' + item.patientGender)}
              </Text>
            )}
            {item.patientDateOfBirth > new Date('January 01 1500') && (
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
            )}
            {item.patientAddress && (
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
            {forms[item.formUUID] &&
              _.filter(
                _.split(forms[item.formUUID].tags, ','),
                e => e !== ''
              ).map((s: string, n: number) => (
                <Text style={[styleS.truncated, styleS.pl3]} key={n}>
                  {i18n.t('tag.' + s)}
                </Text>
              ))}
          </View>
        </View>

        <View style={[layout.vStack, layout.width30percent]}>
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
          {item.caseId && <Text>item.caseId</Text>}
        </View>
      </View>
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
  const styleS = useStyleSheet(themedStyles)
  const patientDateOfBirth = formatDate(
    item.patientDateOfBirth,
    'PPP'
  ) as string
  return (
    <Pressable
      style={[spacing.px2, layout.flex1]}
      // _hover={{ bg: 'coolGray.100' }}
      onPress={() => selectItem(item)}
    >
      <View
        style={[
          layout.hStack,
          layout.alignCenter,
          layout.flex1,
          layout.spaceBet,
        ]}
      >
        <View style={[layout.vStack, layout.width45percent]}>
          <Text style={[styleS.truncated, styleS.fontBold]}>
            {item.patientName || i18n.t('record.missing-patient-name')}
          </Text>
          <Text style={[styleS.truncated, styleS.ml2]}>
            {item.patientGender ? i18n.t('gender.' + item.patientGender) : ''}
          </Text>
          {patientDateOfBirth &&
            item.patientDateOfBirth > new Date('January 01 1500') && (
              <Text style={[styleS.truncated, styleS.ml2]}>
                {patientDateOfBirth}
              </Text>
            )}
          <Text style={[styleS.truncated, styleS.ml2]}>
            {item.patientAddress ? item.patientAddress : ''}
          </Text>
          <Text>{item.recordID}</Text>
        </View>

        <View style={[layout.vStack, layout.width20percent]}>
          {forms &&
            forms[item.formUUID] &&
            _.filter(
              _.split(forms[item.formUUID].tags, ','),
              e => e !== ''
            ).map((s: string, n: number) => (
              <Text style={[styleS.truncated]} key={n}>
                {i18n.t('tag.' + s)}
              </Text>
            ))}
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
        </View>

        <View style={[layout.vStack, layout.width20percent]}>
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
        </View>

        <View style={[layout.vStack, layout.width5percent]}>
          {item.sealed ? (
            <Icon fill="success" size="6" name="star" />
          ) : (
            <Icon fill="danger" size="6" name="star-outline" />
          )}
        </View>
      </View>
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
  const styleS = useStyleSheet(themedStyles)
  const [forms, setForms] = useState({} as Record<string, FormMetadata>)
  const [users, setUsers] = useState({} as Record<string, Partial<UserType>>)
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>()
  const [selectedIndexType, setSelectedIndexType] = useState<IndexPath>()
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
  const items = [i18n.t('record.filter.any-is-sealed'), 'enabled', 'disabled']
  const onSelect = (index: IndexPath) => {
    setSelectedIndex(index)
    const num: number = index.row
    if (setFilterSealed) {
      setFilterSealed(items[num])
    }
  }
  const types = ['record-id', 'patient-name']
  const onSelectType = (index: IndexPath) => {
    // TODO:
    setSelectedIndexType(index)
    setFilterSearchType(types[index.row])
  }

  return (
    <>
      <View
        style={[
          {
            flexDirection: isWider ? 'row' : 'column',
            marginBottom: isWider ? 4 : 0,
          },
          layout.justifyCenter,
        ]}
      >
        <View style={layout.center}>
          <SelectLocation
            bg="white"
            placeholder={i18n.t('user.enter-location')}
            any={'user.any-location'}
            value={filterLocationID}
            setValue={(id, _uuid) => setFilterLocationID(id)}
            mx={Platform.OS === 'android' ? 0 : { md: 2, base: 0 }}
            my={Platform.OS === 'android' ? 2 : { md: 0, base: 2 }}
            w={Platform.OS === 'android' ? '80%' : undefined}
          />
        </View>
        {setFilterSealed && (
          <View style={layout.center}>
            <Select
              selectedIndex={selectedIndex}
              size="medium"
              style={{
                backgroundColor: 'white',
                marginLeft: Platform.OS === 'android' ? 0 : isWider ? 8 : 0,
              }}
              onSelect={index => onSelect(index as IndexPath)}
              // selectedValue={filterSealed}
              // onValueChange={setFilterSealed}
              placeholder={i18n.t('record.filter.select-record-sealed')}
              // ml={Platform.OS === 'android' ? 0 : { base: 0, md: 2 }}
            >
              {/* <Select.Item
                key={'__any__'}
                label={i18n.t('record.filter.any-is-sealed')}
                value={''}
              /> */}
              {items.map(e => (
                <SelectItem
                  key={e}
                  title={i18n.t('record.filter.' + e)}
                  // value={e}
                />
              ))}
            </Select>
          </View>
        )}
        <View style={layout.center}>
          <Select
            size="medium"
            style={{
              backgroundColor: 'white',
              marginLeft: Platform.OS === 'android' ? 0 : isWider ? 8 : 0,
              width: Platform.OS === 'android' ? '90%' : '100%',
            }}
            selectedIndex={selectedIndexType}
            onSelect={index => onSelectType(index as IndexPath)}
            // selectedValue={filterSearchType}
            // onValueChange={setFilterSearchType}
            placeholder={i18n.t('record.search-by.select')}
          >
            {types.map(e => (
              <SelectItem
                key={e}
                title={i18n.t('record.search-by.' + e)}
                // value={e}
              />
            ))}
          </Select>
        </View>
      </View>
      <View
        style={[
          styles.recordListStack,
          { flexDirection: isWider ? 'row' : 'column' },
        ]}
      >
        <View style={[layout.hStack, layout.justifyCenter]}>
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
                pack="material"
                size="tiny"
                name="search"
                fill={colors.coolGray[400]}
                style={[styleS.my2, styleS.ml2]}
              />
            }
            size="lg"
            color="black"
            placeholder={i18n.t('user.search.form-names-and-tags')}
            debounceMs={1000}
            value={filterText}
            onChangeText={setFilterText}
          />
          <IconButtonLg
            name="close"
            size={32}
            color={colors.primary[500]}
            onPress={() => {
              setFilterLocationID('')
              setFilterSearchType('')
              setFilterText('')
            }}
          />
          <IconButtonLg
            name="refresh"
            size={32}
            onPress={doSearch}
            color={colors.primary[500]}
          />
        </View>
      </View>
      <View
        style={[
          styles.locationListVStack,
          isWider ? styles.locationListVStackMd : styles.locationListVStackBase,
        ]}
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
              <View
                style={[
                  layout.hStack,
                  layout.alignCenter,
                  layout.spaceBet,
                  borders.borderBW1,
                  borders.borderColorCG200,
                ]}
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
                  {i18n.t('record.heading.patient')}
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
                  {i18n.t('record.heading.form')}
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
                  {i18n.t('record.heading.changed-created')}
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
                  {i18n.t('record.heading.sealed')}
                </Text>
              </View>
              <View style={[layout.vStackGap3, spacing.mt3]}>
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
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </>
  )
}
