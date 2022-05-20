import React from 'react'
import {
  Box,
  HStack,
  Text,
  VStack,
  ScrollView,
  Pressable,
  Stack,
  Center,
  Button,
  Icon,
  Select,
} from 'native-base'
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

export function ListItem({
  item,
  onPress,
}: {
  item: FormMetadata
  onPress: (i: FormMetadata) => any
}) {
  return (
    <Pressable p={2}>
      <HStack justifyContent="space-between" w="100%">
        <HStack alignItems="center" space={4} w="70%">
          <VStack>
            <Text
              isTruncated
              bold
              fontSize="sm"
              _light={{ color: 'coolGray.900' }}
            >
              {item.title}
            </Text>
            <Text
              pl={3}
              isTruncated
              fontSize="sm"
              _light={{ color: 'coolGray.900' }}
            >
              {item.subtitle}
            </Text>
          </VStack>
        </HStack>
        <VStack w="30%">
          <Text isTruncated fontSize="sm" _light={{ color: 'coolGray.900' }}>
            {formatDate(item.createdDate, 'PPP')}
          </Text>
          <Text isTruncated fontSize="sm" _light={{ color: 'coolGray.900' }}>
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
          <Text bold isTruncated>
            {item.title}
          </Text>
          <Text isTruncated ml={2}>
            {item.subtitle}
          </Text>
        </VStack>

        <VStack w="20%">
          {_.split(item.tags, ',').map((s: string, n: number) => (
            <Text isTruncated key={n}>
              {t('tag.' + s)}
            </Text>
          ))}
          <Text>{item.formID}</Text>
        </VStack>

        <VStack w="20%">
          <Text isTruncated>{formatDate(item.lastChangedDate, 'PPP')}</Text>
        </VStack>

        <HStack w="5%">
          {item.enabled ? (
            <Icon
              color="success.400"
              size="6"
              name="check-circle"
              as={MaterialIcons}
            />
          ) : (
            <Icon color="error.700" size="6" name="cancel" as={MaterialIcons} />
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
            setValue={setFilterLocationID}
            mx={{ md: 2, base: 0 }}
            my={{ md: 0, base: 2 }}
          />
        </Center>
        <Center>
          <AnyCountry
            bg="white"
            placeholder={t('location.select-country')}
            value={filterCountry}
            setValue={setFilterCountry}
            any={'location.any-country'}
            mt={{ md: 0, base: 2 }}
          />
        </Center>
        <Center>
          <Language
            bg="white"
            placeholder={t('location.select-language')}
            value={filterLanguage}
            setValue={setFilterLanguage}
            any={'location.any-language'}
            mx={{ md: 2, base: 0 }}
            my={{ md: 0, base: 2 }}
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
            setFilterCountry('')
            setFilterLanguage('')
            setFilterLocationID('')
            setFilterSearchType('')
            setFilterText('')
          }}
          leftIcon={<Icon as={MaterialIcons} name="close" />}
          size="sm"
          mr={2}
        />
        <Button
          onPress={doSearch}
          leftIcon={<Icon as={MaterialIcons} name="refresh" />}
          size="sm"
          mr={2}
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
        <Box>
          <ScrollView>
            <Box position="relative" display={{ md: 'none', base: 'flex' }}>
              {forms.map((item: FormMetadata, index: number) => {
                // TODO ListItem not clickable
                // return <ListItem item={item} key={index} onPress={selectItem} />
                return (
                  <ListItemDesktop
                    item={item}
                    key={index}
                    selectItem={selectItem}
                  />
                )
              })}
            </Box>
            <Box display={{ md: 'flex', base: 'none' }}>
              <HStack
                alignItems="center"
                justifyContent="space-between"
                borderBottomWidth={1}
                _light={{ borderColor: 'coolGray.200' }}
              >
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="50%"
                  mb={3}
                  _light={{ color: 'coolGray.800' }}
                >
                  Title
                </Text>
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="25%"
                  mb={3}
                  _light={{ color: 'coolGray.900' }}
                >
                  Tags / Form ID
                </Text>
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="20%"
                  mb={3}
                  _light={{ color: 'coolGray.900' }}
                >
                  Date changed
                </Text>
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="10%"
                  mb={3}
                  _light={{ color: 'coolGray.900' }}
                  mr={-1}
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
            </Box>
          </ScrollView>
        </Box>
      </VStack>
    </>
  )
}
