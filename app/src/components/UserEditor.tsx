import React, { useState } from 'react'
import { Badge, Select, Tooltip, Heading } from 'native-base'
import { userTypes, UserType } from 'utils/types/user'
import FloatingLabelInput from 'components/FloatingLabelInput'
import NecessaryItem from 'components/NecessaryItem'
import { t } from 'i18n-js'
import _ from 'lodash'
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
import { Button, useStyleSheet } from '@ui-kitten/components'
import themedStyles from 'themeStyled'
import { layout, spacing } from './styles'
import {
  AlertIcon,
  PlusIcon,
  SaveIcon,
  CheckIcon,
  LockIcon,
  CloseIcon,
} from './Icons'
import { View } from 'react-native'

const styleS = useStyleSheet(themedStyles)

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
      <View style={[layout.vStack]}>
        <FloatingLabelInput
          label={t('user.full-official-name')}
          value={user.formal_name}
          setValue={v => setUser({ ...user, formal_name: v })}
          mt={10}
        />
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
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
        </View>
        {user.userType === 'Manager' && (
          <View style={[layout.center]}>
            <View style={[layout.hStackGap5, spacing.py2]}>
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
                    accessoryLeft={AlertIcon}
                    status="warning"
                    onPress={() =>
                      setUser(u => {
                        return { ...u, allowed_locations: '' }
                      })
                    }
                    style={[styleS.mb2]}
                    // _text={{ selectable: false }}
                  >
                    Revoke admin permissions
                  </Button>
                ) : (
                  <Button
                    accessoryLeft={AlertIcon}
                    status="danger"
                    onPress={() =>
                      setUser(u => {
                        return { ...u, allowed_locations: '' }
                      })
                    }
                    // _text={{ selectable: false }}
                    style={[styleS.mb2]}
                  >
                    Make user an admin
                  </Button>
                ))}
            </View>
          </View>
        )}
        {!_.includes(user.allowed_locations, 'admin') && (
          <View style={[layout.vStack, spacing.py2]}>
            <View style={[layout.center, spacing.pb2]}>
              <Button
                status="info"
                accessoryLeft={PlusIcon}
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
                // _text={{ selectable: false }}
              >
                Add allowed location
              </Button>
            </View>
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
              <View style={[layout.center]}>
                <Heading size="md" color="red.600">
                  Add permissions for at least one location
                </Heading>
              </View>
            )}
          </View>
        )}
        <View style={[layout.center]}>
          <DateTimePicker
            isDisabled={false}
            title={t('user.expiry-date')}
            fancyLabel={t('user.expiry-date')}
            date={user.expiry_date}
            open={() => false}
            close={() => false}
            setDate={(date: Date) => setUser({ ...user, expiry_date: date })}
          />
        </View>
        {!createMode && (
          <View style={[layout.center]}>
            <NecessaryItem
              isDone={user.enabled || false}
              todoText="User is disabled"
              doneText="User is enabled"
              size="tiny"
            />
          </View>
        )}
        <View style={[layout.center, spacing.pt4, spacing.pb2]}>
          <Heading size="md" fontWeight="normal" px={2}>
            {t('user.heading.bio')}
          </Heading>
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
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
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
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
        </View>
        <FloatingLabelInput
          label={t('user.address')}
          value={user.address}
          setValue={v => setUser({ ...user, address: v })}
        />
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
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
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
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
        </View>
        <View style={[layout.center, spacing.pt4, spacing.pb2]}>
          <Heading size={'md'} fontWeight={'normal'} px={2}>
            {t('user.heading.official-id')}
          </Heading>
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
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
        </View>
        <FloatingLabelInput
          label={t('user.official_id_code')}
          value={user.official_id_code}
          setValue={v => setUser({ ...user, official_id_code: v })}
        />
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
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
        </View>
        <View style={[layout.center, spacing.pt4, spacing.pb2]}>
          <Heading size={'md'} fontWeight={'normal'} px={2}>
            {t('user.heading.metadata')}
          </Heading>
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
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
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
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
        </View>
        {createMode ? (
          <View style={[layout.hStack, layout.justifyCenter, spacing.my5]}>
            <Button
              accessoryLeft={SaveIcon}
              status="success"
              onPress={handleCreateUser}
            >
              {t('user.create-user')}
            </Button>
          </View>
        ) : (
          <View style={[layout.vStack]}>
            <View style={[layout.center]}>
              <View style={[layout.hStack, layout.spaceBet, spacing.my5]}>
                {user.status === 'FORCE_CHANGE_PASSWORD' &&
                  user.email_verified !== 'true' && (
                    <Button status="info" onPress={resendConfirmationEmail}>
                      {t('user.resend-confirmation-email')}
                    </Button>
                  )}
                {user.status === 'CONFIRMED' && user.email_verified !== 'true' && (
                  <Button
                    accessoryLeft={CheckIcon}
                    status="warning"
                    onPress={confirmEmail}
                  >
                    {t('user.confirm-email')}
                  </Button>
                )}
              </View>
            </View>
            <View style={[layout.hStack, layout.spaceBet, spacing.my5]}>
              <Button
                accessoryLeft={SaveIcon}
                status="success"
                onPress={handleSubmitUser}
              >
                {t('user.submit-user')}
              </Button>
              {user.email_verified === 'true' && (
                <Button
                  accessoryLeft={LockIcon}
                  status="warning"
                  onPress={resetPassword}
                >
                  {t('user.reset-password')}
                </Button>
              )}
              <Tooltip openDelay={0} label="Submit first" isDisabled={!changed}>
                <Button
                  accessoryLeft={user.enabled ? CloseIcon : CheckIcon}
                  status={user.enabled ? 'danger' : 'success'}
                  onPress={toggleUser}
                >
                  {user.enabled
                    ? t('user.disable-user')
                    : t('user.enable-user')}
                </Button>
              </Tooltip>
            </View>
          </View>
        )}
      </View>
      <Loading loading={waiting} />
    </>
  )
}
