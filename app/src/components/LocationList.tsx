import React, { useState } from 'react'
import {
  HStack,
  Stack,
  Center,
  VStack,
  ScrollView,
  Pressable,
  Select,
} from 'native-base'
import { Text, useStyleSheet, Button, Icon } from '@ui-kitten/components'
import themedStyles from 'themeStyled'
import { Platform } from 'react-native'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { LocationType, locationEntityTypes } from 'utils/types/location'
import AnyCountry from 'components/AnyCountry'
import Language from 'components/Language'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import { View, Dimensions } from 'react-native'
import { breakpoints, colors } from './nativeBaseSpec'
import { spacing } from './styles'
import { CloseIcon, RefreshIcon } from './Icons'

const { width } = Dimensions.get('window')
const styleS = useStyleSheet(themedStyles)
export function ListItem({ item }: { item: LocationType }) {
  return (
    <Pressable p={2} borderBottomWidth={0.8} borderBottomColor="coolGray.300">
      <HStack justifyContent="space-between" w="100%">
        <HStack alignItems="center" space={4} w="55%">
          <VStack>
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
            <HStack>
              <Text
                style={[
                  styleS.truncated,
                  styleS.fontSizeSm,
                  styleS.colorCoolGray600,
                  styleS.pl3,
                ]}
              >
                {t('location.entity.' + item.entityType)}
              </Text>
              <Text
                style={[styleS.truncated, styleS.colorCoolGray600, styleS.ml2]}
              >
                {t('country.' + item.country)}
              </Text>
            </HStack>
            <Text
              style={[
                styleS.truncated,
                styleS.colorCoolGray700,
                styleS.fontSizeSm,
              ]}
            >
              {formatDate(item.lastChangedDate, 'PPP') as string}
            </Text>
          </VStack>
        </HStack>
        <HStack alignItems="center" space={4} w="32%">
          <VStack>
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
          </VStack>
        </HStack>
        <HStack w="5%">
          {item.enabled ? (
            <Icon fill="success" size="6" name="check-circle" pack="material" />
          ) : (
            <Icon fill="danger" size="6" name="cancel" pack="material" />
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
  item: LocationType
  selectItem: (location: LocationType) => any
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
          <Text style={[styleS.fontBold, styleS.truncated]} numberOfLines={2}>
            {item.legalName}
          </Text>
          <HStack alignItems="center" flex={1} justifyContent="flex-start">
            <Text style={[styleS.truncated, spacing.ml2]}>
              {item.shortName}
            </Text>
          </HStack>
          <Text style={[styleS.truncated, spacing.ml2]}>
            {t('location.entity.' + item.entityType)}
          </Text>
        </VStack>

        <VStack w="20%">
          <Text style={[styleS.truncated]}>{t('country.' + item.country)}</Text>
          <Text style={[styleS.truncated]}>
            {t('languages.' + item.language)}
          </Text>
        </VStack>

        <VStack w="30%">
          <Text style={[styleS.truncated]}>
            {formatDate(item.lastChangedDate, 'PPP') as string}
          </Text>
          <Text style={[styleS.truncated]}>{item.locationID}</Text>
        </VStack>

        <HStack w="5%">
          {item.enabled ? (
            <Icon fill="success" size="6" name="check-circle" pack="material" />
          ) : (
            <Icon fill="danger" size="6" name="cancel" pack="material" />
          )}
        </HStack>
      </HStack>
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
  const isWider = width > breakpoints.md
  return (
    <>
      <Stack
        direction={{ md: 'row', base: 'column' }}
        mb={{ md: 1, base: 0 }}
        justifyContent="center"
      >
        <Center>
          <AnyCountry
            bg="white"
            placeholder={t('location.select-country')}
            value={filterCountry}
            setValue={setFilterCountry}
            any={'location.any-country'}
            // mt={Platform.OS === 'android' ? 2 : { md: 0, base: 2 }}
            // w={Platform.OS === 'android' ? '80%' : undefined}
          />
        </Center>
        <Center>
          <Language
            bg="white"
            placeholder={t('location.select-language')}
            value={filterLanguage}
            setValue={setFilterLanguage}
            any={'location.any-language'}
            mx={Platform.OS === 'android' ? 0 : { md: 2, base: 0 }}
            my={Platform.OS === 'android' ? 2 : { md: 0, base: 2 }}
            w={Platform.OS === 'android' ? '80%' : undefined}
          />
        </Center>
        <Center>
          <Select
            size="md"
            bg="white"
            selectedValue={filterEntityType}
            onValueChange={setFilterEntityType}
            placeholder={t('location.select-entity-type')}
          >
            <Select.Item
              key={'__any__'}
              label={t('location.any-entity-type')}
              value={''}
            />
            {locationEntityTypes.map(e => (
              <Select.Item
                key={e}
                label={t('location.entity.' + e)}
                value={e}
              />
            ))}
          </Select>
        </Center>
        <HStack
          my={{ md: 0, base: 2 }}
          mb={{ md: 1, base: 2 }}
          justifyContent="center"
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
        </HStack>
      </Stack>
      <HStack py={2} w="100%" justifyContent="center" bg={'muted.50'}>
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
          placeholder={t('location.search')}
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
                    styleS.width30Percent,
                    styleS.colorCoolGray800,
                    spacing.ml1,
                    spacing.mb3,
                  ]}
                >
                  {t('heading.name')}
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
                  {t('heading.countryAndLanguage')}
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
                  {t('heading.lastChangedAndId')}
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
                  {t('heading.enabled')}
                </Text>
              </HStack>
              <VStack mt={3} space={3}>
                {locations.map((item: LocationType, index: number) => {
                  return (
                    <ListItemDesktop
                      item={item}
                      key={index}
                      selectItem={selectItem}
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
