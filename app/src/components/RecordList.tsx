import React, { useState, useEffect } from 'react'
import {
  Text,
  useStyleSheet,
  Select,
  SelectItem,
  IndexPath,
} from '@ui-kitten/components'
import themedStyles from '../themeStyled'
// @ts-ignore Record some reason expo doesn't pick up this module without the extension
import { useStoreState } from '../utils/store'
import _ from 'lodash'
import { RecordMetadata } from 'utils/types/recordMetadata'
import { FormMetadata } from 'utils/types/formMetadata'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import { getFormCached, getUserByUUIDCached } from 'api/common'
import { UserType } from 'utils/types/user'
import {
  Platform,
  View,
  Dimensions,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { breakpoints } from './nativeBaseSpec'
import { colors } from './nativeBaseSpec'
import styles, { borders, layout, spacing } from './styles'
import IconButtonLg from './IconButtonLg'
import { ListItemMobile, ListItemDesktop } from './RecordListItem'
import { InputSearchIcon } from './Icons'
import { SearchFilters } from '../screens/provider/FindRecord'
const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md

export default function RecordList({
  records,
  filters,
  setFilters,
  doSearch,
  selectItem,
  filter,
}: {
  records: RecordMetadata[]
  hasMore: boolean
  loadMore?: () => any
  itemsPerPage?: number
  filters: SearchFilters
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>
  doSearch: () => any
  selectItem: (r: RecordMetadata) => any
  filter: (r: RecordMetadata) => boolean
}) {
  const state = useStoreState()
  const i18n = state?.i18n
  const styleS = useStyleSheet(themedStyles)
  const [forms, setForms] = useState({} as Record<string, FormMetadata>)
  const [users, setUsers] = useState({} as Record<string, Partial<UserType>>)
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
  // const items = [i18n.t('record.filter.any-is-sealed'), 'enabled', 'disabled']
  const types = ['record-id', 'patient-name']
  const onSelectType = (index: IndexPath) => {
    // TODO:
    setSelectedIndexType(index)
    setFilters({ ...filters, type: types[index.row] })
  }
  const setFilterText = (val: string) => {
    setFilters({ ...filters, text: val })
  }

  return (
    <>
      <View style={nativeS.selectWrapper}>
        <View style={layout.center}>
          <Select
            size="medium"
            style={nativeS.select}
            selectedIndex={selectedIndexType}
            onSelect={index => onSelectType(index as IndexPath)}
            placeholder={i18n.t('record.search-by.select')}
            value={
              filters.type
                ? i18n.t('record.search-by.' + filters.type)
                : i18n.t('record.search-by.' + types[0])
            }
          >
            {types.map(e => (
              <SelectItem key={e} title={i18n.t('record.search-by.' + e)} />
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
            placeholder={i18n.t('user.search.form-names-and-tags')}
            debounceMs={1000}
            value={filters.text}
            onChangeText={setFilterText}
          />
          <IconButtonLg
            name="close"
            size={32}
            color={colors.primary[500]}
            onPress={() => {
              setFilters({ type: '', text: '' })
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
            <View style={nativeS.widerFlex}>
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

const nativeS = StyleSheet.create({
  select: {
    backgroundColor: 'white',
    marginLeft: Platform.OS === 'android' ? 0 : isWider ? 8 : 0,
    width: Platform.OS === 'android' ? '90%' : '100%',
  },
  selectWrapper: {
    flexDirection: isWider ? 'row' : 'column',
    marginBottom: isWider ? 4 : 0,
    justifyContent: 'center',
  },
  widerFlex: {
    display: isWider ? 'flex' : 'none',
  },
})
const responsiveFlex = {
  display: isWider ? 'flex' : 'none',
}
