import React, { useState } from 'react'
import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  ScrollView,
  Pressable,
  Input,
} from 'native-base'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { FormMetadata } from 'utils/formTypes'

export function ListItem({ item }: { item: FormMetadata }) {
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
              {item.name}
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

export function ListItemDesktop({ item }: { item: FormMetadata }) {
  return (
    <Pressable p={2} flex={1}>
      <HStack alignItems="center" flex={1} justifyContent="space-between">
        <VStack w="45%">
          <Text bold isTruncated>
            {item.name}
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
          <Text key={100}>{item.formID}</Text>
        </VStack>

        <VStack w="20%">
          <Text isTruncated>{formatDate(item.createdDate, 'PPP')}</Text>
        </VStack>

        <HStack w="5%">
          {item.enabled ? (
            <Icon
              color="success.400"
              size="6"
              name={'check-circle'}
              as={MaterialIcons}
            />
          ) : (
            <Icon
              color="error.700"
              size="6"
              name={'cancel'}
              as={MaterialIcons}
            />
          )}
        </HStack>
      </HStack>
    </Pressable>
  )
}

export default function FormList({
  forms,
  itemsPerPage = 20,
}: {
  forms: FormMetadata[]
  itemsPerPage?: number
}) {
  const [page, setPage] = useState(1)
  const numberOfPages = Math.ceil(forms.length / itemsPerPage)
  return (
    <>
      <HStack
        pt={{ md: 5, base: 2 }}
        mb={{ md: 5, base: 0 }}
        w="100%"
        justifyContent="space-between"
        _light={{ bg: { base: 'white', md: 'muted.50' } }}
      >
        <Input
          flex={{ md: undefined, lg: undefined, base: 1 }}
          w={{ md: '100%', lg: '100%', base: '90%' }}
          py={3}
          mx={{ base: 4, md: 0 }}
          mr={{ base: 4, md: 4, lg: 30, xl: 40 }}
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
          placeholder="Search for form names, ids, tags, or locations"
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
                return <ListItem item={item} key={index} />
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
                  Tags
                </Text>
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="20%"
                  mb={3}
                  _light={{ color: 'coolGray.900' }}
                >
                  Date
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
                  return <ListItemDesktop item={item} key={index} />
                })}
              </VStack>
            </Box>
          </ScrollView>
        </Box>
      </VStack>
      {numberOfPages !== 1 && (
        <HStack
          display={{ base: 'none', md: 'flex' }}
          space="2"
          alignItems="center"
          mt="2"
          justifyContent="flex-end"
        >
          {_.range(1, numberOfPages + 1).map((n: number) => (
            <Pressable
              height={8}
              width={8}
              borderRadius={4}
              bg="white"
              color="coolGray.500"
              textAlign="center"
              justifyContent="center"
              borderColor={n === page ? 'primary.700' : undefined}
              borderWidth={n === page ? 1 : undefined}
              onPress={() => setPage(n)}
            >
              <Text color="coolGray.500" fontSize="sm">
                {n}
              </Text>
            </Pressable>
          ))}
        </HStack>
      )}
    </>
  )
}
