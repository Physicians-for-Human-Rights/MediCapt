import React, { useState } from 'react'
import {
  Badge,
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
  Text,
  Modal,
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
import {
  createUser,
  updateUser,
  resetUserPassword,
  confirmUserEmail,
  resendUserConfirmationEmail,
} from 'api/manager'
import { standardHandler } from 'api/utils'
import Photo from 'components/form-parts/Photo'
import DateTimePicker from 'components/DateTimePicker'
import { dataURItoBlob } from 'utils/data'
import { splitLocations } from 'utils/types/user'
import { useUserLocationIDs } from 'utils/store'
import { useDeepCompareEffect } from 'react-use'
import { getLocationCached } from 'api/common'
import { LocationType } from 'utils/types/location'
import LocationListStatic from 'components/LocationListStatic'
import {
  RootStackScreenProps,
  RootStackParamList,
} from 'utils/manager/navigation'
import { StackNavigationProp } from '@react-navigation/stack'

const dummyDate = new Date()

async function sendImageLink(user: Partial<UserType>, imageLink: any) {
  if (
    user.official_id_image &&
    !_.startsWith(user.official_id_image, 'https://')
  ) {
    let form = new FormData()
    for (const field in imageLink.fields) {
      form.append(field, imageLink.fields[field])
    }
    form.append('file', dataURItoBlob(user.official_id_image))
    await fetch(imageLink.url, {
      method: 'POST',
      headers: {},
      body: form,
    })
  }
}

export default function UserEditor({
  files,
  user,
  setUser,
  changed,
  navigation,
  reloadPrevious,
}: {
  files: Record<string, any>
  user: Partial<UserType>
  setUser: React.Dispatch<React.SetStateAction<Partial<UserType>>>
  changed: boolean
  navigation: StackNavigationProp<RootStackParamList, 'EditUser'>
  reloadPrevious: React.MutableRefObject<boolean>
}) {
  const [error, warning, success] = useInfo()
  const [waiting, setWaiting] = useState(null as null | string)
  const standardReporters = { setWaiting, error, warning, success }

  const createMode = !(user.userUUID && user.userUUID !== '')

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
        sendImageLink(user, r.imageLink)
        setUser(r.user)
        reloadPrevious.current = true
      }
    )

  const submitUser = (
    updatedUser: Partial<UserType>,
    inProgressMessage?: string,
    message?: string
  ) =>
    standardHandler(
      standardReporters,
      inProgressMessage || t('user.submitting-user'),
      message || t('user.submitted-user'),
      async () => {
        const r = await updateUser(
          //@ts-ignore We validate this before the call
          updatedUser
        )
        sendImageLink(updatedUser, r.imageLink)
        setUser(r.user)
        reloadPrevious.current = true
      }
    )

  const [locations, setLocations] = useState({} as Record<string, LocationType>)
  useDeepCompareEffect(() => {
    async function fn() {
      try {
        const l = {} as Record<string, LocationType>
        for (const lID of splitLocations(user.allowed_locations)) {
          if (lID === 'admin') continue
          const r = await getLocationCached(lID, () => null)
          if (r) l[lID] = r
        }
        setLocations(l)
      } catch (e) {
        error('Failed to locations')
      } finally {
        setWaiting(null)
      }
    }
    fn()
  }, [splitLocations(user.allowed_locations)])

  const handleSubmitUser = () => submitUser(user)

  const toggleUser = () => {
    const newUser = { ...user, enabled: !user.enabled }
    setUser(newUser)
    submitUser(newUser)
  }

  const resetPassword = async () =>
    standardHandler(
      standardReporters,
      t('user.password-resetting'),
      t('user.password-reset'),
      async () => {
        await resetUserPassword(user)
      }
    )

  const confirmEmail = async () =>
    standardHandler(
      standardReporters,
      t('user.confirming-email'),
      t('user.email-confirmed'),
      async () => {
        await confirmUserEmail(user)
        user.email_verified = 'true'
      }
    )

  const resendConfirmationEmail = async () =>
    standardHandler(
      standardReporters,
      t('user.resending-confirmation-email'),
      t('user.resent-confirmation-email'),
      async () => {
        await resendUserConfirmationEmail(user)
      }
    )

  const editorAllowedLocationIDs = useUserLocationIDs()

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
        {user.userType === 'Manager' && (
          <Center>
            <HStack py={2} space={5}>
              {_.includes(user.allowed_locations, 'admin') && (
                <Badge
                  colorScheme="red"
                  _text={{
                    fontSize: 16,
                  }}
                  alignSelf="center"
                  variant="subtle"
                  mt={-1}
                >
                  User is an administrator
                </Badge>
              )}
              {_.includes(editorAllowedLocationIDs, 'admin') &&
                (_.includes(user.allowed_locations, 'admin') ? (
                  <Button
                    leftIcon={
                      <Icon as={Feather} name="alert-triangle" size="sm" />
                    }
                    bg="warning.500"
                    onPress={() =>
                      setUser(u => {
                        return { ...u, allowed_locations: '' }
                      })
                    }
                    _text={{ selectable: false }}
                    mb={2}
                  >
                    Revoke admin permissions
                  </Button>
                ) : (
                  <Button
                    leftIcon={
                      <Icon as={Feather} name="alert-triangle" size="sm" />
                    }
                    bg="error.500"
                    onPress={() =>
                      setUser(u => {
                        return { ...u, allowed_locations: '' }
                      })
                    }
                    _text={{ selectable: false }}
                    mb={2}
                  >
                    Make user an admin
                  </Button>
                ))}
            </HStack>
          </Center>
        )}
        {!_.includes(user.allowed_locations, 'admin') && (
          <VStack py={2}>
            <Center pb={2}>
              <Button
                bg={'info.500'}
                leftIcon={<Icon as={Feather} name="plus-square" size="sm" />}
                onPress={() => {
                  navigation.push('FindLocation', {
                    onSelect: async l => {
                      setUser(u => {
                        return {
                          ...u,
                          allowed_locations: _.join(
                            _.uniq(
                              _.concat(splitLocations(user.allowed_locations), [
                                l.locationUUID,
                              ])
                            ),
                            ' '
                          ),
                        }
                      })
                      navigation.goBack()
                    },
                  })
                }}
                _text={{ selectable: false }}
              >
                Add allowed location
              </Button>
            </Center>
            {splitLocations(user.allowed_locations) !== ['admin'] &&
            !_.isEmpty(splitLocations(user.allowed_locations)) ? (
              <LocationListStatic
                locations={_.map(splitLocations(user.allowed_locations), l =>
                  l in locations ? locations[l] : l
                )}
                selectItem={l => {
                  setUser(u => {
                    return {
                      ...u,
                      allowed_locations: _.join(
                        _.without(
                          splitLocations(user.allowed_locations),
                          l.locationUUID
                        ),
                        ' '
                      ),
                    }
                  })
                }}
              />
            ) : (
              <Center>
                <Heading size="md" color="red.600">
                  Add permissions for at least one location
                </Heading>
              </Center>
            )}
          </VStack>
        )}
        <Center>
          <DateTimePicker
            isDisabled={false}
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
          <Heading size="md" fontWeight="normal" px={2}>
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
            label={t('user.phone-number-with-help')}
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
          <VStack>
            <Center>
              <HStack my={5} justifyContent="space-between">
                {user.status === 'FORCE_CHANGE_PASSWORD' &&
                  user.email_verified !== 'true' && (
                    <Button
                      colorScheme="info"
                      onPress={resendConfirmationEmail}
                    >
                      {t('user.resend-confirmation-email')}
                    </Button>
                  )}
                {user.status === 'CONFIRMED' && user.email_verified !== 'true' && (
                  <Button
                    leftIcon={
                      <Icon as={MaterialIcons} name="check" size="sm" />
                    }
                    colorScheme="orange"
                    onPress={confirmEmail}
                  >
                    {t('user.confirm-email')}
                  </Button>
                )}
              </HStack>
            </Center>
            <HStack my={5} justifyContent="space-between">
              <Button
                leftIcon={<Icon as={MaterialIcons} name="save" size="sm" />}
                colorScheme="green"
                onPress={handleSubmitUser}
              >
                {t('user.submit-user')}
              </Button>
              {user.email_verified === 'true' && (
                <Button
                  leftIcon={<Icon as={MaterialIcons} name="lock" size="sm" />}
                  colorScheme="orange"
                  onPress={resetPassword}
                >
                  {t('user.reset-password')}
                </Button>
              )}
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
                  {user.enabled
                    ? t('user.disable-user')
                    : t('user.enable-user')}
                </Button>
              </Tooltip>
            </HStack>
          </VStack>
        )}
      </VStack>
      <Loading loading={waiting} />
    </>
  )
}
