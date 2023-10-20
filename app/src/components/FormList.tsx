import React from 'react'
import {
  HStack,
  VStack,
  ScrollView,
  Pressable,
  Stack,
  Center,
} from 'native-base'
import {
  Text,
  useStyleSheet,
  Button,
  Select,
  SelectItem,
  IndexPath,
  Icon,
} from '@ui-kitten/components'
import themedStyles from 'themeStyled'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { FormMetadata } from 'utils/types/formMetadata'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import SelectLocation from 'components/SelectLocation'
import AnyCountry from 'components/AnyCountry'
import Language from 'components/Language'
import { Platform, View, Dimensions } from 'react-native'
import { breakpoints, colors } from './nativeBaseSpec'
import { CloseIcon, RefreshIcon } from './Icons'

const { width } = Dimensions.get('window')
const styleS = useStyleSheet(themedStyles)

export function ListItem({
  item,
  selectItem,
}: {
  item: FormMetadata
  selectItem: (i: FormMetadata) => any
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
                styleS.fontSizeSm,
                styleS.colorCoolGray900,
                styleS.pl3,
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
}: {
  item: FormMetadata
  selectItem: (i: FormMetadata) => any
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
          <Text style={[styleS.fontBold, styleS.truncated]}>{item.title}</Text>
          <Text style={[styleS.ml2, styleS.truncated]}>{item.subtitle}</Text>
        </VStack>

        <VStack w="20%">
          {_.split(item.tags, ',').map((s: string, n: number) => (
            <Text style={[styleS.truncated]} key={n}>
              {t('tag.' + s)}
            </Text>
          ))}
          <Text>{item.formID}</Text>
        </VStack>

        <VStack w="20%">
          <Text style={[styleS.truncated]}>
            {formatDate(item.lastChangedDate, 'PPP') as string}
          </Text>
        </VStack>

        <HStack w="5%">
          {item.enabled ? (
            <Icon
              fill="success"
              // color="success.400"
              size="6"
              name="check-circle"
              pack="material"
            />
          ) : (
            <Icon
              // color="error.700"
              fill="error"
              size="6"
              name="cancel"
              pack="material"
            />
          )}
        </HStack>
      </HStack>
    </Pressable>
  )
}

export default function FormList({
  forms,
  hasMore = false,
  loadMore,
  filterCountry,
  setFilterCountry,
  filterLanguage,
  setFilterLanguage,
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
  forms: FormMetadata[]
  hasMore: boolean
  loadMore?: () => any
  itemsPerPage?: number
  filterCountry: string
  setFilterCountry: React.Dispatch<React.SetStateAction<string>>
  filterLanguage: string
  setFilterLanguage: React.Dispatch<React.SetStateAction<string>>
  filterLocationID: string
  setFilterLocationID: React.Dispatch<React.SetStateAction<string>>
  filterSearchType: string
  setFilterSearchType: React.Dispatch<React.SetStateAction<string>>
  filterEnabled?: string | undefined
  setFilterEnabled?: React.Dispatch<React.SetStateAction<string>> | undefined
  filterText: string | undefined
  setFilterText: React.Dispatch<React.SetStateAction<string | undefined>>
  doSearch: () => any
  selectItem: (f: FormMetadata) => any
}) {
  const selectList: string[] = [
    t('form.filter.any-is-form-enabled'),
    'enabled',
    'disabled',
  ]
  const onChangeSelect = (path: IndexPath | IndexPath[]) => {
    if (!Array.isArray(path) && path.row && setFilterEnabled) {
      setFilterEnabled(selectList[path.row])
    }
  }
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
        <Center>
          <AnyCountry
            bg="white"
            placeholder={t('location.select-country')}
            value={filterCountry}
            setValue={setFilterCountry}
            any={'location.any-country'}
            // mt={Platform.OS === 'android' ? 0 : { md: 0, base: 2 }}
            // ml={Platform.OS === 'android' ? 0 : 3}
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
            my={Platform.OS === 'android' ? 1 : { md: 0, base: 2 }}
            w={Platform.OS === 'android' ? '80%' : undefined}
          />
        </Center>
        {setFilterEnabled && (
          <Center>
            <Select
              size="medium"
              value={filterEnabled}
              onSelect={onChangeSelect}
              placeholder={t('form.filter.select-form-enabled')}
              style={[
                styleS.bgWhite,
                { marginLeft: width > breakpoints.md ? 4 : 0 },
              ]}
            >
              <>
                <SelectItem
                  key={'__any__'}
                  title={t('form.filter.any-is-form-enabled')}
                  // value={''}
                />
                {['enabled', 'disabled'].map(e => (
                  <SelectItem key={e} title={t('form.filter.' + e)} />
                ))}
              </>
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
              // as={<AntDesign name="search1" />}
              pack="material"
              name="search"
              size="tiny"
              style={[styleS.my2, styleS.ml2]}
              fill={colors.coolGray[400]}
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
            setFilterCountry('')
            setFilterLanguage('')
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
                display: width > breakpoints.md ? 'none' : 'flex',
              }}
            >
              {forms.map((item: FormMetadata, index: number) => {
                return (
                  <ListItem item={item} key={index} selectItem={selectItem} />
                )
              })}
            </View>
            <View style={{ display: width > breakpoints.md ? 'flex' : 'none' }}>
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
                  Title
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
                  Tags / Form ID
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
                  Date changed
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
                  Enabled
                </Text>
              </HStack>
              <VStack mt={3} space={3}>
                {forms.map((item: FormMetadata, index: number) => {
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
