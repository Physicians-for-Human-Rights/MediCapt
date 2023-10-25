import React, { useState, useEffect } from 'react'
import { Text, useStyleSheet } from '@ui-kitten/components'
import themedStyles from 'themeStyled'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { Share } from 'utils/types/share'
import { ScrollView, Pressable, Dimensions, View } from 'react-native'
import { UserType } from 'utils/types/user'
import { getUserByUUIDCachedAnyPool } from 'api/common'
import { userFullName, UserKindNames } from 'utils/userTypes'
import { breakpoints } from './nativeBaseSpec'
import styles, { layout, spacing } from './styles'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md
const styleS = useStyleSheet(themedStyles)

export function ListItemMobile({
  item,
  selectItem,
  users,
}: {
  item: Share
  selectItem: (i: Share) => any
  users: Record<string, Partial<UserType>>
}) {
  return (
    <Pressable style={spacing.p2} onPress={() => selectItem(item)}>
      <View style={[layout.hStack, layout.spaceBet, layout.width100percent]}>
        <View
          style={[layout.hStackGap4, layout.alignCenter, layout.width60percent]}
        >
          <View style={[layout.vStack]}>
            <Text
              style={[
                styleS.truncated,
                styleS.fontBold,
                styleS.fontSizeSm,
                styleS.colorCoolGray900,
              ]}
            >
              {item.formTitle}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.pl3,
                styleS.fontSizeSm,
                styleS.colorCoolGray900,
              ]}
            >
              {item.formSubtitle}
            </Text>
          </View>
        </View>
        <View
          style={[layout.hStackGap4, layout.alignCenter, layout.width40percent]}
        >
          <View style={[layout.vStack]}>
            <Text
              style={[
                styleS.truncated,
                styleS.fontBold,
                styleS.fontSizeSm,
                styleS.colorCoolGray900,
              ]}
            >
              {item.formTitle}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.pl3,
                styleS.fontSizeSm,
                styleS.colorCoolGray900,
              ]}
            >
              {item.formSubtitle}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

export function ListItemDesktop({
  item,
  selectItem,
  users,
}: {
  item: Share
  selectItem: (i: Share) => any
  users: Record<string, Partial<UserType>>
}) {
  return (
    <Pressable
      style={[spacing.p2, layout.flex1]}
      // _hover={{ bg: 'coolGray.100' }}
      onPress={() => selectItem(item)}
    >
      <View style={[layout.hStack, layout.alignCenter, layout.flex1]}>
        <View style={[layout.vStack, layout.width60percent]}>
          <Text style={[styleS.fontBold, styleS.truncated]}>
            {userFullName(users[item.sharedWithUUID], item.sharedWithUUID)}
          </Text>
          <Text style={[styleS.ml2, styleS.truncated]}>
            {t('user.' + item.sharedWithUUIDUserType)}
          </Text>
          <Text style={[styleS.ml2, styleS.truncated]}>
            {users[item.sharedWithUUID]
              ? users[item.sharedWithUUID].phone_number
              : ''}
          </Text>
          <Text style={[styleS.ml2, styleS.truncated]}>
            {users[item.sharedWithUUID] ? users[item.sharedWithUUID].email : ''}
          </Text>
          <Text style={[styleS.ml2, styleS.truncated]}>
            {users[item.sharedWithUUID]
              ? users[item.sharedWithUUID].address
              : ''}
          </Text>
        </View>
        <View style={[layout.vStack, layout.width40percent]}>
          <View style={[layout.hStack]}>
            <Text style={[styleS.fontBold, styleS.truncated]}>Shared on</Text>
            <Text style={[styleS.ml2, styleS.truncated]}>
              {formatDate(item.createdDate, 'PPP') as string}
            </Text>
          </View>
          <View style={[layout.hStack]}>
            <Text style={[styleS.fontBold, styleS.truncated]}>Expires on</Text>
            <Text style={[styleS.ml2, styleS.truncated]}>
              {formatDate(item.shareExpiresOn, 'PPP') as string}
            </Text>
          </View>
          <Text style={[styleS.fontBold, styleS.truncated]}>Shared by</Text>
          <Text style={[styleS.ml2, styleS.truncated]}>
            {userFullName(users[item.createdByUUID], item.createdByUUID)}
          </Text>
          <Text style={[styleS.ml2, styleS.truncated]}>
            {users[item.sharedWithUUID] ? users[item.sharedWithUUID].email : ''}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

export default function ShareListStatic({
  shares,
  selectItem,
}: {
  shares: Share[]
  selectItem: (f: Share) => any
}) {
  const [users, setUsers] = useState({} as Record<string, Partial<UserType>>)

  useEffect(() => {
    async function usersFn() {
      const loadedUsers = {} as Record<string, Partial<UserType>>
      await Promise.all(
        _.map(
          _.uniq(
            _.concat(
              _.map(shares, r => r.createdByUUID),
              _.map(shares, r => r.lastChangedByUUID),
              _.map(shares, r => r.sharedWithUUID)
            )
          ),
          async userUUID => {
            const result = await getUserByUUIDCachedAnyPool(
              userUUID,
              () => null
            )
            if (result) loadedUsers[userUUID] = result
            return result
          }
        )
      )
      setUsers(loadedUsers)
    }
    usersFn()
  }, [shares])

  return (
    <>
      <View
        style={[
          styles.locationListVStack,
          isWider ? styles.locationListVStackMd : styles.locationListVStackBase,
        ]}
      >
        <View>
          <ScrollView>
            <View
              style={{
                position: 'relative',
                display: isWider ? 'none' : 'flex',
              }}
            >
              {shares.map((item: Share, index: number) => {
                return (
                  <ListItemMobile
                    item={item}
                    key={index}
                    selectItem={selectItem}
                    users={users}
                  />
                )
              })}
            </View>
            <View
              style={{
                display: isWider ? 'flex' : 'none',
              }}
            >
              <View style={[layout.vStackGap3, spacing.mt3]}>
                {shares.map((item: Share, index: number) => {
                  return (
                    <ListItemDesktop
                      item={item}
                      key={index}
                      selectItem={selectItem}
                      users={users}
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
