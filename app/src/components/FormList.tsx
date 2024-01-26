import React from 'react'
import { ScrollView } from 'react-native'
import {
  Text,
  useStyleSheet,
  Select,
  SelectItem,
  IndexPath,
  Icon,
} from '@ui-kitten/components'
import themedStyles from '../themeStyled'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import { useStoreState } from '../utils/store'
import _ from 'lodash'
import { FormMetadata } from 'utils/types/formMetadata'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import SelectLocation from 'components/SelectLocation'
import AnyCountry from 'components/AnyCountry'
import Language from 'components/Language'
import { Platform, View, Dimensions } from 'react-native'
import { breakpoints, colors } from './nativeBaseSpec'
import styles, { layout, spacing, backgrounds } from './styles'
import IconButtonLg from './IconButtonLg'
import FormListItem from './FormListItem'
import FormListItemDesktop from './FormListItemDesktop'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md

interface IProps {
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
}: IProps) {
  const state = useStoreState()
  const i18n = state?.i18n
  const selectList: string[] = [
    i18n.t('form.filter.any-is-form-enabled'),
    'enabled',
    'disabled',
  ]
  const onChangeSelect = (path: IndexPath | IndexPath[]) => {
    if (!Array.isArray(path) && path.row && setFilterEnabled) {
      setFilterEnabled(selectList[path.row])
    }
  }
  const resetValues = () => {
    setFilterCountry('')
    setFilterLanguage('')
    setFilterLocationID('')
    setFilterSearchType('')
    setFilterText('')
  }
  const styleS = useStyleSheet(themedStyles)
  return (
    <>
      <View
        style={{
          flexDirection: isWider ? 'row' : 'column',
          marginBottom: isWider ? 4 : 0,
          justifyContent: 'center',
        }}
      >
        <View style={[layout.center]}>
          <SelectLocation
            bg="white"
            placeholder={i18n.t('user.enter-location')}
            any={'user.any-location'}
            value={filterLocationID}
            setValue={(id, _uuid) => setFilterLocationID(id)}
            // mx={Platform.OS === 'android' ? 0 : { md: 2, base: 0 }}
            // my={Platform.OS === 'android' ? 1 : { md: 0, base: 2 }}
            // w={Platform.OS === 'android' ? '80%' : undefined}
          />
        </View>
        <View style={[layout.center, spacing.mr2]}>
          <AnyCountry
            bg="white"
            placeholder={i18n.t('location.select-country')}
            value={filterCountry}
            setValue={setFilterCountry}
            any={'location.any-country'}
            // mt={Platform.OS === 'android' ? 0 : { md: 0, base: 2 }}
            // ml={Platform.OS === 'android' ? 0 : 3}
            // w={Platform.OS === 'android' ? '80%' : undefined}
          />
        </View>
        <View style={[layout.center]}>
          <Language
            bg="white"
            value={filterLanguage}
            setValue={setFilterLanguage}
            any={'location.any-language'}
            // mx={Platform.OS === 'android' ? 0 : { md: 2, base: 0 }}
            // my={Platform.OS === 'android' ? 1 : { md: 0, base: 2 }}
            // w={Platform.OS === 'android' ? '80%' : undefined}
          />
        </View>
        {setFilterEnabled && (
          <View style={[layout.center]}>
            <Select
              size="medium"
              value={filterEnabled}
              onSelect={onChangeSelect}
              placeholder={i18n.t('form.filter.select-form-enabled')}
              style={[
                styleS.bgWhite,
                { marginLeft: width > breakpoints.md ? 4 : 0 },
              ]}
            >
              <>
                <SelectItem
                  key={'__any__'}
                  title={i18n.t('form.filter.any-is-form-enabled')}
                  // value={''}
                />
                {['enabled', 'disabled'].map(e => (
                  <SelectItem key={e} title={i18n.t('form.filter.' + e)} />
                ))}
              </>
            </Select>
          </View>
        )}
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
          placeholder={i18n.t('user.search.form-names-and-tags')}
          debounceMs={1000}
          value={filterText}
          onChangeText={setFilterText}
        />
        <IconButtonLg
          name="close"
          size={32}
          onPress={resetValues}
          color={colors.primary[500]}
        />
        <IconButtonLg
          name="refresh"
          size={32}
          onPress={doSearch}
          color={colors.primary[500]}
        />
      </View>
      <View
        style={[
          styles.formListVStack,
          isWider ? styles.formListVStackMd : styles.formListVStackBase,
        ]}
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
                  <FormListItem
                    item={item}
                    key={index}
                    selectItem={selectItem}
                  />
                )
              })}
            </View>
            <View style={{ display: width > breakpoints.md ? 'flex' : 'none' }}>
              <View style={styles.formListHStack}>
                <Text
                  style={[
                    styleS.fontBold,
                    styleS.textLeft,
                    styleS.width50Percent,
                    styleS.mb3,
                    styleS.colorCoolGray800,
                  ]}
                >
                  {i18n.t('common.title')}
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
                  {i18n.t('form.tags-id')}
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
                  {i18n.t('common.dataChanged')}
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
                {forms.map((item: FormMetadata, index: number) => {
                  return (
                    <FormListItemDesktop
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
