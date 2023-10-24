import React, { useState, useEffect } from 'react'
import { ScrollView, Pressable, Select } from 'native-base'
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
import styles, { backgrounds, borders, layout, spacing } from './styles'

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
        </View>
      </View>
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
      <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
        <View style={[layout.vStack, layout.width45percent]}>
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
        </View>
        <View style={[layout.vStack, layout.width30percent]}>
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
        </View>
        <View style={[layout.vStack, layout.width20percent]}>
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
        </View>
      </View>
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
      <View
        style={[
          layout.justifyCenter,
          {
            flexDirection: isWider ? 'row' : 'column',
            marginBottom: isWider ? 4 : 0,
          },
        ]}
      >
        <View style={[layout.center]}>
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
        </View>
        {setFilterEnabled && (
          <View style={[layout.center]}>
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
          </View>
        )}
      </View>
      <View
        style={[
          layout.hStack,
          layout.justifyCenter,
          backgrounds.bgMuted50,
          layout.width100percent,
          spacing.py2,
        ]}
      >
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
              </View>
              <View style={[layout.vStackGap3, spacing.mt3]}>
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
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </>
  )
}
