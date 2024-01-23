import React, { useState } from 'react'
import { UserType } from 'utils/types/user'
import NecessaryItem from 'components/NecessaryItem'
import _ from 'lodash'
import Loading from 'components/Loading'
import DateTimePicker from 'components/DateTimePicker'
import { splitLocations } from 'utils/types/user'
import { useUserLocationIDs } from 'utils/store'
import { useDeepCompareEffect } from 'react-use'
import { getLocationCached } from 'api/common'
import { LocationType } from 'utils/types/location'
import LocationListStatic from 'components/LocationListStatic'
import { RootStackParamList } from 'utils/manager/navigation'
import { StackNavigationProp } from '@react-navigation/stack'
import { Button, useStyleSheet, Text } from '@ui-kitten/components'
import themedStyles from '../themeStyled'
import { layout, spacing } from './styles'
import { AlertIcon, PlusIcon } from './Icons'
import { View, Dimensions } from 'react-native'
import { useToast } from 'react-native-toast-notifications'
import { useStoreState } from '../utils/store'

import UserBasicInfo from './UserBasicInfo'
import UserBio from './UserBio'
import UserOfficialId from './UserOfficialId'
import UserMetaData from './UserMetaData'
import UserEditorActions from './UserEditorActions'

export const inputStyle = {
  paddingHorizontal: 24,
  minHeight: 90,
}

const windowWidth = Dimensions.get('window').width
export const isWider = windowWidth > 480
export const stackStyle = isWider
  ? [layout.hStack, layout.alignCenter, layout.spaceBet]
  : [layout.vStack]

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
  // const date = new Date()
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
  const [isError, setIsError] = useState<boolean>(true)
  // const foundIndex = userTypes.findIndex(user => user === user.userType)
  // const [selectedIndex, setSelectedIndex] = useState<IndexPath>(
  //   new IndexPath(0)
  // )
  // const standardReporters = { setWaiting, error, warning, success }

  const createMode = !(user.userUUID && user.userUUID !== '')

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

  const editorAllowedLocationIDs = useUserLocationIDs()

  return (
    <>
      <View style={[layout.vStack]}>
        <UserBasicInfo user={user} setUser={setUser} />
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
                        console.log({ l, u })
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
            {/* not sure what this want to check */}
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
        <UserBio user={user} setUser={setUser} setIsError={setIsError} />
        <UserOfficialId user={user} setUser={setUser} />
        <UserMetaData user={user} />
        <UserEditorActions
          user={user}
          setUser={setUser}
          reloadPrevious={reloadPrevious}
          changed={changed}
          isError={isError}
        />
      </View>
      <Loading loading={waiting} />
    </>
  )
}
