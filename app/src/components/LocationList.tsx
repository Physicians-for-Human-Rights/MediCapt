import React, { useState } from 'react'
import {
  Text,
  useStyleSheet,
  Button,
  Icon,
  Select,
  SelectItem,
  IndexPath,
} from '@ui-kitten/components'
import themedStyles from '../themeStyled'
import { ScrollView, Pressable, Platform } from 'react-native'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { useStoreState } from '../utils/store'
import _ from 'lodash'
import { LocationType, locationEntityTypes } from 'utils/types/location'
import AnyCountry from 'components/AnyCountry'
import Language from 'components/Language'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import { View, Dimensions } from 'react-native'
import { breakpoints, colors } from './nativeBaseSpec'
import styles, { backgrounds, borders, layout, spacing } from './styles'
import { CloseIcon, RefreshIcon } from './Icons'

import mockData from '../mockData/locations'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md

export function ListItem({ item }: { item: LocationType }) {
  const state = useStoreState()
  const i18n = state?.i18n
  const styleS = useStyleSheet(themedStyles)
  return (
    <Pressable
      style={[spacing.p2, borders.borderColorCG200, { borderBottomWidth: 0.8 }]}
    >
      <View style={[layout.spaceBet, layout.hStack, layout.width100percent]}>
        <View
          style={[layout.hStackGap4, layout.alignCenter, layout.width55percent]}
        >
          <View style={layout.vStack}>
            <Text
              style={[
                styleS.truncated,
                styleS.fontBold,
                styleS.fontSizeSm,
                styleS.maxWidth64x4,
                styleS.colorCoolGray900,
              ]}
            >
              {item.legalName}
            </Text>
            <View style={layout.hStack}>
              <Text
                style={[
                  styleS.truncated,
                  styleS.fontSizeSm,
                  styleS.colorCoolGray600,
                  styleS.pl3,
                ]}
              >
                {i18n.t('location.entity.' + item.entityType)}
              </Text>
              <Text
                style={[styleS.truncated, styleS.colorCoolGray600, styleS.ml2]}
              >
                {i18n.t('country.' + item.country)}
              </Text>
            </View>
            <Text
              style={[
                styleS.truncated,
                styleS.colorCoolGray700,
                styleS.fontSizeSm,
              ]}
            >
              {formatDate(item.lastChangedDate, 'PPP') as string}
            </Text>
          </View>
        </View>
        <View
          style={[layout.hStackGap4, layout.alignCenter, layout.width32percent]}
        >
          <View style={layout.vStack}>
            <Text
              style={[
                styleS.truncated,
                styleS.colorCoolGray900,
                styleS.fontSizeXs,
                styleS.maxWidth100Percent,
              ]}
            >
              {item.shortName}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.colorCoolGray900,
                styleS.fontSizeXs,
                styleS.maxWidth100Percent,
              ]}
            >
              {item.locationID}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.colorCoolGray500,
                styleS.fontSizeXs,
                styleS.maxWidth100Percent,
              ]}
            >
              {formatDate(item.createdDate, 'PPP') as string}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.colorCoolGray500,
                styleS.fontSizeXs,
                styleS.maxWidth60Percent,
              ]}
            >
              {item.enabled}
            </Text>
          </View>
        </View>
        <View style={layout.width5percent}>
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

export function ListItemDesktop({
  item,
  selectItem,
}: {
  item: LocationType
  selectItem: (location: LocationType) => any
}) {
  const state = useStoreState()
  const i18n = state?.i18n
  const styleS = useStyleSheet(themedStyles)
  return (
    <Pressable
      style={[spacing.px2, layout.flex1]}
      // _hover={{ bg: 'coolGray.100' }}
      onPress={() => selectItem(item)}
    >
      <View
        style={[
          layout.alignCenter,
          layout.hStack,
          layout.flex1,
          layout.spaceBet,
        ]}
      >
        <View style={layout.width30percent}>
          <Text style={[styleS.fontBold, styleS.truncated]} numberOfLines={2}>
            {item.legalName}
          </Text>
          <View
            style={[
              layout.alignCenter,
              layout.hStack,
              layout.justifyStart,
              layout.flex1,
            ]}
          >
            <Text style={[styleS.truncated, spacing.ml2]}>
              {item.shortName}
            </Text>
          </View>
          <Text style={[styleS.truncated, spacing.ml2]}>
            {i18n.t('location.entity.' + item.entityType)}
          </Text>
        </View>

        <View style={[layout.width20percent, layout.vStack]}>
          <Text style={[styleS.truncated]}>
            {i18n.t('country.' + item.country)}
          </Text>
          <Text style={[styleS.truncated]}>
            {i18n.t('languages.' + item.language)}
          </Text>
        </View>

        <View style={[layout.width30percent, layout.vStack]}>
          <Text style={[styleS.truncated]}>
            {formatDate(item.lastChangedDate, 'PPP') as string}
          </Text>
          <Text style={[styleS.truncated]}>{item.locationID}</Text>
        </View>

        <View style={[layout.width5percent, layout.hStack]}>
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

export default function LocationList({
  locations,
  hasMore = false,
  loadMore,
  filterCountry,
  setFilterCountry,
  filterLanguage,
  setFilterLanguage,
  filterEntityType,
  setFilterEntityType,
  filterText,
  setFilterText,
  doSearch,
  selectItem,
}: {
  locations: LocationType[]
  hasMore: boolean
  loadMore?: () => any
  filterCountry: string
  setFilterCountry: React.Dispatch<React.SetStateAction<string>>
  filterLanguage: string
  setFilterLanguage: React.Dispatch<React.SetStateAction<string>>
  filterEntityType: string
  setFilterEntityType: React.Dispatch<React.SetStateAction<string>>
  filterText: string | undefined
  setFilterText: React.Dispatch<React.SetStateAction<string | undefined>>
  doSearch: () => any
  selectItem: (location: LocationType) => any
}) {
  locations = mockData
  const state = useStoreState()
  const i18n = state?.i18n
  const styleS = useStyleSheet(themedStyles)
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>()
  const onSelect = (index: IndexPath | IndexPath[]) => {
    if (!IndexPath.length) {
      const obj = index as IndexPath
      setSelectedIndex(obj)
      setFilterEntityType(locationEntityTypes[obj.row])
    }
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
          <AnyCountry
            bg="white"
            placeholder={i18n.t('location.select-country')}
            value={filterCountry}
            setValue={setFilterCountry}
            any={'location.any-country'}
            // mt={Platform.OS === 'android' ? 2 : { md: 0, base: 2 }}
            // w={Platform.OS === 'android' ? '80%' : undefined}
          />
        </View>
        <View style={layout.center}>
          <Language
            bg="white"
            value={filterLanguage}
            setValue={setFilterLanguage}
            any={'location.any-language'}
            mx={Platform.OS === 'android' ? 0 : { md: 2, base: 0 }}
            my={Platform.OS === 'android' ? 2 : { md: 0, base: 2 }}
            w={Platform.OS === 'android' ? '80%' : undefined}
          />
        </View>
        <View style={layout.center}>
          <Select
            size="medium"
            selectedIndex={selectedIndex}
            onSelect={onSelect}
            // selectedValue={filterEntityType}
            // onValueChange={setFilterEntityType}
            placeholder={i18n.t('location.select-entity-type')}
          >
            {locationEntityTypes.map(e => (
              <SelectItem
                key={e}
                title={i18n.t('location.entity.' + e)}
                // value={e}
              />
            ))}
          </Select>
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
              setFilterCountry('')
              setFilterLanguage('')
              setFilterEntityType('')
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
          layout.justifyCenter,
          layout.width100percent,
          spacing.py2,
          backgrounds.bgMuted50,
        ]}
      >
        <DebouncedTextInput
          flex={{ md: undefined, lg: undefined, base: 1 }}
          w={{ md: '90%', lg: '90%', base: '80%' }}
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
          placeholder={i18n.t('location.search')}
          debounceMs={1000}
          value={filterText}
          onChangeText={setFilterText}
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
              {locations.map((item: LocationType, index: number) => {
                return <ListItem item={item} key={index} />
              })}
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
                    styleS.width30Percent,
                    styleS.colorCoolGray800,
                    spacing.ml1,
                    spacing.mb3,
                  ]}
                >
                  {i18n.t('heading.name')}
                </Text>
                <Text
                  style={[
                    styleS.fontBold,
                    styleS.textLeft,
                    styleS.width20Percent,
                    styleS.mb3,
                    styleS.colorCoolGray900,
                  ]}
                >
                  {i18n.t('heading.countryAndLanguage')}
                </Text>
                <Text
                  style={[
                    styleS.fontBold,
                    styleS.textLeft,
                    styleS.width25Percent,
                    styleS.mb3,
                    styleS.colorCoolGray900,
                  ]}
                >
                  {i18n.t('heading.lastChangedAndId')}
                </Text>
                <Text
                  style={[
                    styleS.fontBold,
                    styleS.textLeft,
                    styleS.width10Percent,
                    styleS.mb3,
                    styleS.colorCoolGray900,
                    styleS.mrMinus1,
                  ]}
                >
                  {i18n.t('heading.enabled')}
                </Text>
              </View>
              <View style={[layout.vStackGap3, spacing.mt3]}>
                {locations.map((item: LocationType, index: number) => {
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
