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
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { RecordMetadata } from 'utils/recordTypes'

export function ListItem({ item }: { item: RecordMetadata }) {
  return (
    <Pressable p={2} borderBottomWidth={0.8} borderBottomColor="coolGray.300">
      <HStack justifyContent="space-between" w="100%">
        <HStack alignItems="center" space={4} w="60%">
          <VStack>
            <Text
              isTruncated
              bold
              fontSize="sm"
              noOfLines={2}
              maxW="64"
              color="coolGray.900"
            >
              {item.patientName}
            </Text>
            <HStack>
              <Text pl={3} isTruncated fontSize="sm" color="coolGray.600">
                {item.patientAge}
              </Text>
              <Text isTruncated ml={2} color="coolGray.600">
                {t('gender.' + item.patientGender)}
              </Text>
            </HStack>
            <Text pl={3} isTruncated fontSize="sm" color="coolGray.700">
              {formatDate(item.createdDate || item.lastChangedDate, 'PPP')}
            </Text>
          </VStack>
        </HStack>
        <HStack alignItems="center" space={4} w="40%">
          <VStack>
            <Text isTruncated maxW="60%" fontSize="xs" color="coolGray.900">
              {item.recordID}
            </Text>
            <Text isTruncated maxW="60%" fontSize="xs" color="coolGray.500">
              {item.locationUUID}
            </Text>
            <Text isTruncated fontSize="xs" maxW="60%" color="coolGray.500">
              {item.providerCreatedUUID}
            </Text>
            {_.split(item.formTags, ',').map((s: string, n: number) => (
              <Text isTruncated key={n} fontSize="xs">
                {t('tag.' + s)}
              </Text>
            ))}
          </VStack>
        </HStack>
      </HStack>
    </Pressable>
  )
}

export function ListItemDesktop({ item }: { item: RecordMetadata }) {
  return (
    <Pressable p={2} flex={1} _hover={{ bg: 'coolGray.100' }}>
      <HStack alignItems="center" flex={1} justifyContent="space-between">
        <VStack w="30%">
          <Text bold isTruncated noOfLines={2}>
            {item.patientName}
          </Text>
          <HStack alignItems="center" flex={1} justifyContent="flex-start">
            <Text isTruncated ml={2}>
              {t('gender.' + item.patientGender)}
            </Text>
            <Text isTruncated ml={2}>
              {item.patientAge}
            </Text>
          </HStack>
        </VStack>

        <VStack w="20%">
          {_.split(item.formTags, ',').map((s: string, n: number) => (
            <Text isTruncated key={n}>
              {t('tag.' + s)}
            </Text>
          ))}
          <Text key={100}>{item.recordID}</Text>
        </VStack>

        <VStack w="30%">
          <Text isTruncated>{item.locationUUID}</Text>
          <Text isTruncated>{item.providerCreatedUUID}</Text>
          <Text isTruncated>
            {formatDate(item.createdDate || item.lastChangedDate, 'PPP')}
          </Text>
        </VStack>

        <HStack w="5%">
          {item.completed ? (
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

export default function RecordList({
  records,
  itemsPerPage = 20,
}: {
  records: RecordMetadata[]
  itemsPerPage?: number
}) {
  const [page, setPage] = useState(1)
  const numberOfPages = Math.ceil(records.length / itemsPerPage)
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
              {records.map((item: RecordMetadata, index: number) => {
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
                  w="30%"
                  ml={1}
                  mb={3}
                  _light={{ color: 'coolGray.800' }}
                >
                  Patient
                </Text>
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="20%"
                  mb={3}
                  _light={{ color: 'coolGray.900' }}
                >
                  Details
                </Text>
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="25%"
                  mb={3}
                  _light={{ color: 'coolGray.900' }}
                >
                  Last changed
                </Text>
                <Text
                  fontWeight="bold"
                  textAlign="left"
                  w="10%"
                  mb={3}
                  _light={{ color: 'coolGray.900' }}
                  mr={-1}
                >
                  Complete
                </Text>
              </HStack>
              <VStack mt={3} space={3}>
                {records.map((item: RecordMetadata, index: number) => {
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
