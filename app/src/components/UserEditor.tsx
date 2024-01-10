import React, { useState } from 'react'
import { userTypes, UserType } from 'utils/types/user'
import FloatingLabelInput from 'components/FloatingLabelInput'
import NecessaryItem from 'components/NecessaryItem'
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
import { RootStackParamList } from 'utils/manager/navigation'
import { StackNavigationProp } from '@react-navigation/stack'
import {
  Button,
  useStyleSheet,
  Text,
  Select,
  SelectItem,
  IndexPath,
  Input,
} from '@ui-kitten/components'
import themedStyles from '../themeStyled'
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
import { useToast } from 'react-native-toast-notifications'
import { useStoreState } from '../utils/store'

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
  const date = new Date()
  // user = {
  //   userType: 'Manager',
  //   allowed_locations: `pse adasd Refugee camp Afghanistan English ${date} ML3-QBO-A4L-Q71, ML3-APU-LXZ-7EC`,
  // }
  const state = useStoreState()
  const i18n = state?.i18n
  const toast = useToast()
  const styleS = useStyleSheet(themedStyles)
  // const [error, warning, success] = useInfo()
  const [waiting, setWaiting] = useState(null as null | string)
  // const foundIndex = userTypes.findIndex(user => user === user.userType)
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>(
    new IndexPath(0)
  )
  // const standardReporters = { setWaiting, error, warning, success }
  const standardReporters = () => {
    // write error handler
    return 'err'
  }
  const createMode = !(user.userUUID && user.userUUID !== '')

  const handleCreateUser = () =>
    standardHandler(
      // standardReporters,
      i18n.t('user.system.creatingUser'),
      i18n.t('user.system.userCreated'),
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
      // standardReporters,
      inProgressMessage || i18n.t('user.submitting-user'),
      message || i18n.t('user.submitted-user'),
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
        const msg = i18n.t('location.failed-locations')
        toast.show(msg, {
          type: 'danger',
          placement: 'bottom',
          duration: 5000,
        })
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
      // standardReporters,
      i18n.t('user.password-resetting'),
      i18n.t('user.password-reset'),
      async () => {
        await resetUserPassword(user)
      }
    )

  const confirmEmail = async () =>
    standardHandler(
      // standardReporters,
      i18n.t('user.confirming-email'),
      i18n.t('user.email-confirmed'),
      async () => {
        await confirmUserEmail(user)
        user.email_verified = 'true'
      }
    )

  const resendConfirmationEmail = async () =>
    standardHandler(
      // standardReporters,
      i18n.t('user.resending-confirmation-email'),
      i18n.t('user.resent-confirmation-email'),
      async () => {
        await resendUserConfirmationEmail(user)
      }
    )

  const editorAllowedLocationIDs = useUserLocationIDs()
  const onSelect = (index: IndexPath) => {
    setSelectedIndex(index)
    setUser({ ...user, userType: userTypes[index.row] })
  }

  return (
    <>
      <View style={[layout.vStack]}>
        <Input
          label={i18n.t('user.full-official-name')}
          value={user.formal_name}
          onChangeText={v => setUser({ ...user, formal_name: v })}
          style={{ paddingHorizontal: 24 }}
        />
        <View style={[layout.hStack, layout.spaceBet]}>
          <FloatingLabelInput
            label={
              i18n.t('user.username') +
              (createMode ? '' : ' (' + i18n.t('common.read-only') + ')')
            }
            w="100%"
            containerW="45%"
            value={user.username}
            setValue={v => setUser({ ...user, username: v })}
            isReadOnly={!createMode}
            placeholder={user.username}
          />
          {createMode ? (
            <>
              <Select
                label={i18n.t('user.user-type')}
                size="medium"
                selectedIndex={selectedIndex}
                placeholder={i18n.t('user.user-type')}
                style={{ width: '45%', paddingRight: 24 }}
                onSelect={index => onSelect(index as IndexPath)}
                value={userTypes[selectedIndex.row]}
                // onValueChange={itemValue => {
                //   if (itemValue != null) {
                //     // @ts-ignore this value comes from user.entityType, which is correct
                //     setUser({ ...user, userType: itemValue })
                //   }
                // }}
              >
                {userTypes.map((e, i) => (
                  <SelectItem key={e} title={i18n.t('user.' + e)} />
                ))}
              </Select>
            </>
          ) : (
            <FloatingLabelInput
              label={
                i18n.t('user.user-type') +
                ' (' +
                i18n.t('common.read-only') +
                ')'
              }
              w="100%"
              containerW="45%"
              isReadOnly
              placeholder={i18n.t('user.' + user.userType)}
            />
          )}
        </View>
        {user.userType === 'Manager' && (
          <View style={[layout.center]}>
            <View style={[layout.hStackGap5, spacing.py2]}>
              {_.includes(user.allowed_locations, 'admin') && (
                <Button
                  size="tiny"
                  status="danger"
                  appearance="outline"
                  style={{ marginTop: -4, borderWidth: 0 }}
                  // _text={{
                  //   fontSize: 16,
                  // }}
                  // alignSelf="center"
                  // variant="subtle"
                >
                  {i18n.t('user.user-is-admin')}
                </Button>
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
                    {i18n.t('user.revoke-admin-permissions')}
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
                    {i18n.t('user.make-user-admin')}
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
                {i18n.t('user.add-location')}
              </Button>
            </View>
            {splitLocations(user.allowed_locations) !== ['admin'] &&
            !_.isEmpty(splitLocations(user.allowed_locations)) ? (
              <View style={{ marginHorizontal: 16 }}>
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
              </View>
            ) : (
              <View style={[layout.center]}>
                <Text category="h5" status="danger">
                  {i18n.t('user.system.add-permission')}
                </Text>
              </View>
            )}
          </View>
        )}
        <View style={[layout.center]}>
          <DateTimePicker
            isDisabled={false}
            title={i18n.t('user.expiry-date')}
            fancyLabel={i18n.t('user.expiry-date')}
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
              todoText={i18n.t('user.disabled')}
              doneText={i18n.t('user.enabled')}
              size="tiny"
            />
          </View>
        )}
        <View style={[layout.center, spacing.pt4, spacing.pb2]}>
          <Text category="h5" style={[styleS.fontNormal, styleS.px2]}>
            {i18n.t('user.heading.bio')}
          </Text>
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
          <FloatingLabelInput
            label={i18n.t('user.short-name')}
            w="100%"
            containerW="45%"
            value={user.name}
            setValue={v => setUser({ ...user, name: v })}
          />
          <FloatingLabelInput
            label={i18n.t('user.nickname')}
            w="100%"
            containerW="45%"
            value={user.nickname}
            setValue={v => setUser({ ...user, nickname: v })}
          />
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
          <FloatingLabelInput
            label={i18n.t('user.email')}
            w="100%"
            containerW="45%"
            value={user.email}
            setValue={v => setUser({ ...user, email: v })}
          />
          <FloatingLabelInput
            label={i18n.t('user.phone-number-with-help')}
            w="100%"
            containerW="45%"
            value={user.phone_number}
            setValue={v => setUser({ ...user, phone_number: v })}
          />
        </View>
        <FloatingLabelInput
          label={i18n.t('user.address')}
          value={user.address}
          setValue={v => setUser({ ...user, address: v })}
        />
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
          <FloatingLabelInput
            label={i18n.t('user.gender')}
            w="100%"
            containerW="45%"
            value={user.gender}
            setValue={v => setUser({ ...user, gender: v })}
          />
          <DateTimePicker
            isDisabled={false}
            title={i18n.t('user.birthday')}
            fancyLabel={i18n.t('user.birthday')}
            date={user.birthdate}
            open={() => false}
            close={() => false}
            setDate={(date: Date) => setUser({ ...user, birthdate: date })}
          />
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
          <AnyCountry
            placeholder={i18n.t('location.select-country')}
            value={user.country}
            setValue={v => setUser({ ...user, country: v })}
          />
          <Language
            placeholder={i18n.t('location.select-default-language')}
            value={user.language}
            setValue={v => setUser({ ...user, language: v })}
          />
        </View>
        <View style={[layout.center, spacing.pt4, spacing.pb2]}>
          <Text category="h5" style={[styleS.fontNormal, styleS.px2]}>
            {i18n.t('user.heading.official-id')}
          </Text>
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
          <FloatingLabelInput
            label={i18n.t('user.official_id_type')}
            w="100%"
            containerW="45%"
            value={user.official_id_type}
            setValue={v => setUser({ ...user, official_id_type: v })}
          />
          <DateTimePicker
            isDisabled={false}
            // @ts-ignore TODO Why not?
            title={i18n.t('user.official_id_expires')}
            fancyLabel={i18n.t('user.official_id_expires')}
            date={user.official_id_expires}
            open={() => false}
            close={() => false}
            setDate={(date: Date) =>
              setUser({ ...user, official_id_expires: date })
            }
          />
        </View>
        <FloatingLabelInput
          label={i18n.t('user.official_id_code')}
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
          <Text category="h5" style={[styleS.px2, styleS.fontNormal]}>
            {i18n.t('user.heading.metadata')}
          </Text>
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
          <FloatingLabelInput
            label={
              i18n.t('user.id') +
              ' (' +
              i18n.t('common.automatically-created') +
              ')'
            }
            w="100%"
            containerW="45%"
            isReadOnly
            placeholder={
              user.userID ? user.userID : i18n.t('user.not-yet-created')
            }
          />
          <FloatingLabelInput
            isReadOnly
            label={
              i18n.t('user.created-on') +
              ' (' +
              i18n.t('common.automatically-created') +
              ')'
            }
            placeholder={
              user && user.created_time
                ? user.created_time.toString()
                : i18n.t('user.not-yet-created')
            }
            w="100%"
            containerW="45%"
          />
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
          <FloatingLabelInput
            isReadOnly
            label={
              i18n.t('user.last-changed') +
              ' (' +
              i18n.t('common.automatically-created') +
              ')'
            }
            placeholder={
              user.last_updated_time
                ? user.last_updated_time.toString()
                : i18n.t('user.not-yet-created')
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
              {i18n.t('user.create-user')}
            </Button>
          </View>
        ) : (
          <View style={[layout.vStack]}>
            <View style={[layout.center]}>
              <View style={[layout.hStack, layout.spaceBet, spacing.my5]}>
                {user.status === 'FORCE_CHANGE_PASSWORD' &&
                  user.email_verified !== 'true' && (
                    <Button status="info" onPress={resendConfirmationEmail}>
                      {i18n.t('user.resend-confirmation-email')}
                    </Button>
                  )}
                {user.status === 'CONFIRMED' && user.email_verified !== 'true' && (
                  <Button
                    accessoryLeft={CheckIcon}
                    status="warning"
                    onPress={confirmEmail}
                  >
                    {i18n.t('user.confirm-email')}
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
                {i18n.t('user.submit-user')}
              </Button>
              {user.email_verified === 'true' && (
                <Button
                  accessoryLeft={LockIcon}
                  status="warning"
                  onPress={resetPassword}
                >
                  {i18n.t('user.reset-password')}
                </Button>
              )}
              {changed && <Text category="p1">Submit first</Text>}

              <Button
                accessoryLeft={user.enabled ? CloseIcon : CheckIcon}
                status={user.enabled ? 'danger' : 'success'}
                onPress={toggleUser}
              >
                {user.enabled
                  ? i18n.t('user.disable-user')
                  : i18n.t('user.enable-user')}
              </Button>
            </View>
          </View>
        )}
      </View>
      <Loading loading={waiting} />
    </>
  )
}
