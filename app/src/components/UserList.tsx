import React, { useState } from 'react'
import { Dimensions, Platform, ScrollView, Pressable } from 'react-native'
import {
  Text,
  useStyleSheet,
  Button,
  Icon,
  Select,
  SelectItem,
  IndexPath,
} from '@ui-kitten/components'
import { View } from 'react-native'
import themedStyles from '../themeStyled'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { UserType } from 'utils/types/user'
import { UserKindList } from 'utils/userTypes'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import SelectLocation from 'components/SelectLocation'
import { breakpoints } from './nativeBaseSpec'
import styles, { backgrounds, borders, spacing } from './styles'
import { CloseIcon, RefreshIcon } from './Icons'
import { colors } from './nativeBaseSpec'
import { layout } from './styles'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md

export function ListItem({ item }: { item: UserType }) {
  const styleS = useStyleSheet(themedStyles)
  return (
    <Pressable
      style={[
        spacing.p2,
        { borderBottomWidth: 0.8, borderBottomColor: colors.coolGray[300] },
      ]}
    >
      <View style={[layout.hStack, layout.spaceBet, layout.width100percent]}>
        <View
          style={[layout.hStackGap4, layout.alignCenter, layout.width55percent]}
        >
          <View>
            <Text
              style={[
                styleS.truncated,
                styleS.fontBold,
                styleS.fontSizeSm,
                styleS.maxWidth64x4,
                styleS.colorCoolGray900,
              ]}
            >
              {item?.legalName}
            </Text>
            <View style={[layout.hStack]}>
              <Text
                style={[
                  styleS.truncated,
                  styleS.pl3,
                  styleS.fontSizeSm,
                  styleS.colorCoolGray600,
                ]}
              >
                {t('user.user.' + item.userType)}
              </Text>
              <Text
                style={[styleS.truncated, styleS.ml2, styleS.colorCoolGray600]}
              >
                {t('country.' + item.country)}
              </Text>
            </View>
            <Text
              style={[styleS.truncated, styleS.pl3, styleS.colorCoolGray700]}
            >
              {formatDate(item?.lastChangedDate, 'PPP') as string}
            </Text>
          </View>
        </View>
        <View
          style={[layout.hStackGap4, layout.alignCenter, layout.width32percent]}
        >
          <View style={[layout.vStack]}>
            <Text
              style={[
                styleS.truncated,
                styleS.maxWidth100Percent,
                styleS.fontSizeXs,
                styleS.colorCoolGray900,
              ]}
            >
              {item.shortName}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.maxWidth100Percent,
                styleS.fontSizeXs,
                styleS.colorCoolGray900,
              ]}
            >
              {item.userID}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.maxWidth100Percent,
                styleS.fontSizeXs,
                styleS.colorCoolGray500,
              ]}
            >
              {formatDate(item.createdDate, 'PPP') as string}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.maxWidth60Percent,
                styleS.fontSizeXs,
                styleS.colorCoolGray500,
              ]}
            >
              {item.enabled}
            </Text>
          </View>
        </View>
        <View style={[layout.hStack, layout.width5percent]}>
          {item.enabled ? (
            <Icon fill="success" size="6" name="check-circle" pack="material" />
          ) : (
            <Icon color="danger" size="6" name="cancel" pack="material" />
          )}
        </View>
      </View>
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
        <View style={[layout.vStack, layout.width30percent]}>
          <Text style={[styleS.fontBold, styleS.truncated]} numberOfLines={2}>
            {item.name}
          </Text>
          <View
            style={[
              layout.hStack,
              layout.alignCenter,
              layout.flex1,
              layout.justifyStart,
            ]}
          >
            <Text style={[spacing.ml2, styleS.truncated]}>{item.nickname}</Text>
          </View>
        </View>

        <View style={[layout.vStack, layout.width20percent]}>
          <Text style={[styleS.truncated]}>{item.email}</Text>
          <Text style={[styleS.truncated]}>{item.username}</Text>
        </View>

        <View style={[layout.vStack, layout.width30percent]}>
          <Text style={[styleS.truncated]}>
            {formatDate(item.last_updated_time, 'PPP') as string}
          </Text>
          <Text style={[styleS.truncated]}>{item.userID}</Text>
        </View>

        <View style={[layout.hStack, layout.width5percent]}>
          {item.enabled ? (
            <Icon fill="success" size="6" name="check-circle" pack="material" />
          ) : (
            <Icon fill="danger" size="6" name="cancel" pack="material" />
          )}
        </View>
      </View>
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
  defaultUserType,
  allowedUserTypes,
  onlyEnabledUsers = false,
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
  defaultUserType: string
  allowedUserTypes?: string[]
  onlyEnabledUsers?: boolean
}) {
  const [selectedIndexUser, setSelectedIndexUser] = useState<IndexPath>()
  const [selectedIndexEnabled, setSelectedIndexEnabled] = useState<IndexPath>()
  const [selectedIndexTerm, setSelectedIndexTerm] = useState<IndexPath>()
  const onSelectUser = (index: IndexPath) => {
    setSelectedIndexUser(index)
    const arr = allowedUserTypes ? allowedUserTypes : UserKindList
    setFilterUserType(arr[index.row])
  }
  const enabledUsers = ['enabled', 'disabled']
  const onSelect = (index: IndexPath) => {
    setSelectedIndexEnabled(index)
    setFilterEnabledOrDisabled(enabledUsers[index.row])
  }
  const searchTerms = [
    'username',
    'email',
    'phone-number',
    'name',
    'user-id-code',
  ]
  const onSelectTerms = (index: IndexPath) => {
    setSelectedIndexTerm(index)
    setFilterSearchType(searchTerms[index.row])
  }
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
          <Select
            size="medium"
            style={{ backgroundColor: 'white' }}
            selectedIndex={selectedIndexUser}
            onSelect={index => onSelectUser(index as IndexPath)}
            // selectedValue={filterUserType}
            // onValueChange={setFilterUserType}
            placeholder={t('user.select-user-type')}
          >
            {(allowedUserTypes ? allowedUserTypes : UserKindList).map(e => (
              <SelectItem key={e} title={t('user.' + e)} />
            ))}
          </Select>
        </View>
        {onlyEnabledUsers && (
          <View style={[layout.center]}>
            <Select
              size="medium"
              style={{ backgroundColor: 'white', marginLeft: isWider ? 8 : 0 }}
              selectedIndex={selectedIndexEnabled}
              onSelect={index => onSelect(index as IndexPath)}
              // selectedValue={filterEnabledOrDisabled}
              // onValueChange={setFilterEnabledOrDisabled}
              placeholder={t('user.filter.select-user-enabled')}
            >
              {/* <Select.Item
                key={'__any__'}
                label={t('user.filter.any-is-user-enabled')}
                value={''}
              /> */}
              {enabledUsers.map(e => (
                <SelectItem key={e} title={t('user.filter.' + e)} />
              ))}
            </Select>
          </View>
        )}
        <View style={[layout.center]}>
          <SelectLocation
            bg="white"
            placeholder={t('user.enter-location')}
            any={'user.any-location'}
            value={filterLocation}
            setValue={(_id, uuid) => setFilterLocation(uuid)}
            mx={Platform.OS === 'android' ? 0 : { md: 2, base: 0 }}
            my={Platform.OS === 'android' ? 2 : { md: 0, base: 2 }}
            w={Platform.OS === 'android' ? '80%' : undefined}
          />
        </View>
        <View
          style={[
            layout.hStack,
            layout.justifyCenter,
            { marginVertical: isWider ? 0 : 8, marginBottom: isWider ? 4 : 8 },
          ]}
        >
          <Button
            onPress={() => {
              setFilterUserType(defaultUserType)
              setFilterEnabledOrDisabled('')
              setFilterLocation('')
              setFilterSearchType('')
              setFilterText('')
            }}
            accessoryLeft={CloseIcon}
            size="sm"
            style={[styleS.ml4, styleS.mr2]}
          />
          <Button onPress={doSearch} accessoryLeft={RefreshIcon} size="sm" />
        </View>
      </View>
      <View
        style={[
          layout.hStack,
          layout.width100percent,
          layout.justifyCenter,
          backgrounds.bgMuted50,
          spacing.py2,
        ]}
      >
        <View style={[layout.center]}>
          <Select
            size="medium"
            style={{
              backgroundColor: 'white',
              width: '80%',
              marginLeft: isWider ? 8 : 0,
            }}
            selectedIndex={selectedIndexTerm}
            onSelect={index => onSelectTerms(index as IndexPath)}
            // onValueChange={setFilterSearchType}
            placeholder={t('user.search-by.select')}
          >
            {searchTerms.map(e => (
              <SelectItem
                key={e}
                title={t('user.search-by.' + e)}
                // value={e}
              />
            ))}
          </Select>
        </View>
        <DebouncedTextInput
          flex={{ md: undefined, lg: undefined, base: 1 }}
          w={{ md: '70%', lg: '70%', base: '70%' }}
          py={3}
          mx={{ base: 4, md: 0 }}
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
          placeholder={t('user.search-enter')}
          debounceMs={1000}
          value={filterText}
          onChangeText={setFilterText}
        />
      </View>
      <View
        style={[
          styles.userListView,
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
              {users.map((item: UserType, index: number) => {
                return <ListItem item={item} key={index} />
              })}
            </View>
            <View
              style={{
                display: isWider ? 'flex' : 'none',
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
                    styleS.width30Percent,
                    spacing.ml1,
                    spacing.mb3,
                    styleS.colorCoolGray800,
                  ]}
                >
                  {t('heading.name')}
                </Text>
                <Text
                  style={[
                    styleS.fontBold,
                    styleS.textLeft,
                    styleS.width20Percent,
                    styleS.colorCoolGray900,
                    spacing.mb3,
                  ]}
                >
                  {t('heading.usernameAndEmail')}
                </Text>
                <Text
                  style={[
                    styleS.fontBold,
                    styleS.textLeft,
                    styleS.width25Percent,
                    styleS.colorCoolGray900,
                    spacing.mb3,
                  ]}
                >
                  {t('heading.lastChangedAndId')}
                </Text>
                <Text
                  style={[
                    styleS.fontBold,
                    styleS.textLeft,
                    styleS.width10Percent,
                    styleS.colorCoolGray900,
                    spacing.mb3,
                    styleS.mrMinus1,
                  ]}
                >
                  {t('heading.enabled')}
                </Text>
              </View>
              <View style={[layout.vStackGap3, spacing.mt3]}>
                {users.map((item: UserType, index: number) => {
                  return (
                    <ListItemDesktop
                      item={item}
                      key={index}
                      selectItem={selectItem}
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
