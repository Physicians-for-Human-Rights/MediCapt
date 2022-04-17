import React, { useState } from 'react'
import {
  HStack,
  VStack,
  Button,
  View,
  Icon,
  Select,
  CheckIcon,
  CloseIcon,
  Tooltip,
  Popover,
  Center,
  Heading,
} from 'native-base'
import { userTypes, UserType } from 'utils/types/user'
import FloatingLabelInput from 'components/FloatingLabelInput'
import NecessaryItem from 'components/NecessaryItem'
import { t } from 'i18n-js'
import _ from 'lodash'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  Feather,
  MaterialIcons,
} from '@expo/vector-icons'
import AnyCountry from 'components/AnyCountry'
import Language from 'components/Language'
import Loading from 'components/Loading'
import { useInfo } from 'utils/errors'
import { createUser, updateUser } from 'api/manager'
import { standardHandler } from 'api/utils'
import Photo from 'components/form-parts/Photo'
import DateTimePicker from 'components/DateTimePicker'
import { API } from 'aws-amplify'

const dummyDate = new Date()

function dataURItoBlob(dataURI: any) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1])
  else byteString = unescape(dataURI.split(',')[1])

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length)
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  return new Blob([ia], { type: mimeString })
}

export default function UserEditor({
  files,
  user,
  setUser,
  changed,
}: {
  files: Record<string, any>
  user: Partial<UserType>
  setUser: React.Dispatch<React.SetStateAction<Partial<UserType>>>
  changed: boolean
}) {
  const [error, warning, success] = useInfo()
  const [waiting, setWaiting] = useState(null as null | string)

  const createMode = !(user.userUUID && user.userUUID !== '')

  const standardReporters = { setWaiting, error, warning, success }
  const handleCreateUser = () =>
    standardHandler(
      standardReporters,
      'Creating user',
      'User created',
      async () => {
        const r = await createUser(
          //@ts-ignore We validate this before the call
          user
        )
        let form = new FormData()
        for (const field in r.imageLink.fields) {
          form.append(field, r.imageLink.fields[field])
        }
        form.append('file', dataURItoBlob(user.official_id_image))
        await fetch(r.imageLink.url, {
          method: 'POST',
          headers: {},
          body: form,
        })
        setUser(r.user)
      }
    )

  const submitUser = (updatedUser: Partial<UserType>) =>
    standardHandler(
      standardReporters,
      'Updating user',
      'User updated',
      async () => {
        const r = await updateUser(
          //@ts-ignore We validate this before the call
          updatedUser
        )
        let form = new FormData()
        for (const field in r.imageLink.fields) {
          form.append(field, r.imageLink.fields[field])
        }
        form.append('file', dataURItoBlob(user.official_id_image))
        await fetch(r.imageLink.url, {
          method: 'POST',
          headers: {},
          body: form,
        })
        setUser(r.user)
      }
    )

  const handleSubmitUser = () => submitUser(user)

  const toggleUser = () => {
    const newUser = { ...user, enabled: !user.enabled }
    setUser(newUser)
    submitUser(newUser)
  }

  return (
    <>
      <VStack>
        <FloatingLabelInput
          label={t('user.full-official-name')}
          value={user.formal_name}
          setValue={v => setUser({ ...user, formal_name: v })}
          mt={10}
        />
        <HStack alignItems="center" justifyContent="space-between">
          <FloatingLabelInput
            label={
              t('user.username') +
              (createMode ? '' : ' (' + t('common.read-only') + ')')
            }
            w="100%"
            containerW="45%"
            value={user.username}
            setValue={v => setUser({ ...user, username: v })}
            isReadOnly={!createMode}
            placeholder={user.username}
          />
          {createMode ? (
            <Select
              size="md"
              selectedValue={user.userType}
              placeholder={t('user.user-type')}
              w="95%"
              onValueChange={itemValue => {
                if (itemValue != null) {
                  // @ts-ignore this value comes from user.entityType, which is correct
                  setUser({ ...user, userType: itemValue })
                }
              }}
            >
              {userTypes.map((e, i) => (
                <Select.Item
                  size="md"
                  key={e}
                  label={t('user.' + e)}
                  value={e}
                />
              ))}
            </Select>
          ) : (
            <FloatingLabelInput
              label={t('user.user-type') + ' (' + t('common.read-only') + ')'}
              w="100%"
              containerW="45%"
              isReadOnly
              placeholder={t('user.' + user.userType)}
            />
          )}
        </HStack>
        <FloatingLabelInput
          label={
            t('user.allowed-locations') +
            ' (' +
            t('common.space-separated-location-ids') +
            ')'
          }
          value={user.allowed_locations}
          setValue={v => setUser({ ...user, allowed_locations: v })}
        />
        <Center>
          <DateTimePicker
            isDisabled={false}
            // @ts-ignore TODO Why not?
            title={t('user.expiry-date')}
            fancyLabel={t('user.expiry-date')}
            date={user.expiry_date}
            open={() => false}
            close={() => false}
            setDate={(date: Date) => setUser({ ...user, expiry_date: date })}
          />
        </Center>
        {!createMode && (
          <Center>
            <NecessaryItem
              isDone={user.enabled || false}
              todoText="User is disabled"
              doneText="User is enabled"
              size={4}
            />
          </Center>
        )}
        <Center pt={4} pb={2}>
          <Heading size={'md'} fontWeight={'normal'} px={2}>
            {t('user.heading.bio')}
          </Heading>
        </Center>
        <HStack alignItems="center" justifyContent="space-between">
          <FloatingLabelInput
            label={t('user.short-name')}
            w="100%"
            containerW="45%"
            value={user.name}
            setValue={v => setUser({ ...user, name: v })}
          />
          <FloatingLabelInput
            label={t('user.nickname')}
            w="100%"
            containerW="45%"
            value={user.nickname}
            setValue={v => setUser({ ...user, nickname: v })}
          />
        </HStack>
        <HStack alignItems="center" justifyContent="space-between">
          <FloatingLabelInput
            label={t('user.email')}
            w="100%"
            containerW="45%"
            value={user.email}
            setValue={v => setUser({ ...user, email: v })}
          />
          <FloatingLabelInput
            label={t('user.phone-number')}
            w="100%"
            containerW="45%"
            value={user.phone_number}
            setValue={v => setUser({ ...user, phone_number: v })}
          />
        </HStack>
        <FloatingLabelInput
          label={t('user.address')}
          value={user.address}
          setValue={v => setUser({ ...user, address: v })}
        />
        <HStack alignItems="center" justifyContent="space-between">
          <FloatingLabelInput
            label={t('user.gender')}
            w="100%"
            containerW="45%"
            value={user.gender}
            setValue={v => setUser({ ...user, gender: v })}
          />
          <DateTimePicker
            isDisabled={false}
            title={t('user.birthday')}
            fancyLabel={t('user.birthday')}
            date={user.birthdate}
            open={() => false}
            close={() => false}
            setDate={(date: Date) => setUser({ ...user, birthdate: date })}
          />
        </HStack>
        <HStack alignItems="center" justifyContent="space-between">
          <AnyCountry
            placeholder={t('location.select-country')}
            value={user.country}
            setValue={v => setUser({ ...user, country: v })}
            mx={3}
            mt={1}
            mb={3}
          />
          <Language
            placeholder={t('location.select-default-language')}
            value={user.language}
            setValue={v => setUser({ ...user, language: v })}
            mx={3}
            mt={1}
            mb={3}
          />
        </HStack>
        <Center pt={4} pb={2}>
          <Heading size={'md'} fontWeight={'normal'} px={2}>
            {t('user.heading.official-id')}
          </Heading>
        </Center>
        <HStack alignItems="center" justifyContent="space-between">
          <FloatingLabelInput
            label={t('user.official_id_type')}
            w="100%"
            containerW="45%"
            value={user.official_id_type}
            setValue={v => setUser({ ...user, official_id_type: v })}
          />
          <DateTimePicker
            isDisabled={false}
            // @ts-ignore TODO Why not?
            title={t('user.official_id_expires')}
            fancyLabel={t('user.official_id_expires')}
            date={user.official_id_expires}
            open={() => false}
            close={() => false}
            setDate={(date: Date) =>
              setUser({ ...user, official_id_expires: date })
            }
          />
        </HStack>
        <FloatingLabelInput
          label={t('user.official_id_code')}
          value={user.official_id_code}
          setValue={v => setUser({ ...user, official_id_code: v })}
        />
        <HStack alignItems="center" justifyContent="space-between">
          <Photo
            photos={
              user.official_id_image && user.official_id_image !== 'none'
                ? [{ uri: user.official_id_image, 'date-taken': dummyDate }]
                : []
            }
            addPhoto={p => setUser({ ...user, official_id_image: p.uri })}
            removePhoto={p => setUser({ ...user, official_id_image: 'none' })}
            isDisabled={false}
            onlyOne={true}
          />
        </HStack>
        <Center pt={4} pb={2}>
          <Heading size={'md'} fontWeight={'normal'} px={2}>
            {t('user.heading.metadata')}
          </Heading>
        </Center>
        <HStack alignItems="center" justifyContent="space-between">
          <FloatingLabelInput
            label={
              t('user.id') + ' (' + t('common.automatically-created') + ')'
            }
            w="100%"
            containerW="45%"
            isReadOnly
            placeholder={user.userID ? user.userID : 'Not yet created'}
          />
          <FloatingLabelInput
            isReadOnly
            label={
              t('user.created-on') +
              ' (' +
              t('common.automatically-created') +
              ')'
            }
            placeholder={
              user && user.created_time
                ? user.created_time.toString()
                : 'Not yet created'
            }
            w="100%"
            containerW="45%"
          />
        </HStack>
        <HStack alignItems="center" justifyContent="space-between">
          <FloatingLabelInput
            isReadOnly
            label={
              t('user.last-changed') +
              ' (' +
              t('common.automatically-created') +
              ')'
            }
            placeholder={
              user.last_updated_time
                ? user.last_updated_time.toString()
                : 'Not yet created'
            }
            w="100%"
            containerW="45%"
          />
        </HStack>
        {createMode ? (
          <HStack my={5} justifyContent="center">
            <Button
              leftIcon={<Icon as={MaterialIcons} name="save" size="sm" />}
              colorScheme="green"
              onPress={handleCreateUser}
            >
              {t('user.create-user')}
            </Button>
          </HStack>
        ) : (
          <HStack my={5} justifyContent="space-between">
            <Button
              leftIcon={<Icon as={MaterialIcons} name="save" size="sm" />}
              colorScheme="green"
              onPress={handleSubmitUser}
            >
              {t('user.submit-user')}
            </Button>
            <Tooltip openDelay={0} label="Submit first" isDisabled={!changed}>
              <Button
                leftIcon={
                  user.enabled ? (
                    <CloseIcon size={'5'} mx={2} />
                  ) : (
                    <CheckIcon size={'5'} mx={2} />
                  )
                }
                colorScheme={user.enabled ? 'red' : 'green'}
                onPress={toggleUser}
              >
                {user.enabled ? t('user.disable-user') : t('user.enable-user')}
              </Button>
            </Tooltip>
          </HStack>
        )}
      </VStack>
      <Loading loading={waiting} />
    </>
  )
}
