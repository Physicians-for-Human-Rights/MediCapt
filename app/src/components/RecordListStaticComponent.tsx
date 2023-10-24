import React, { useState, useEffect } from 'react'
import { HStack, VStack, ScrollView, Pressable } from 'native-base'
import { Text, useStyleSheet, Icon } from '@ui-kitten/components'
import themedStyles from 'themeStyled'
// @ts-ignore Record some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { RecordMetadata } from 'utils/types/recordMetadata'
import { FormMetadata } from 'utils/types/formMetadata'
import { getFormCached, getUserByUUIDCached } from 'api/common'
import { UserType } from 'utils/types/user'
import { userFullName } from 'utils/userTypes'
import { View, Dimensions } from 'react-native'
import { breakpoints } from './nativeBaseSpec'
import { layout, spacing } from './styles'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md
const styleS = useStyleSheet(themedStyles)

export function ListItemMobile({
  item,
  selectItem,
  forms,
  users,
}: {
  item: RecordMetadata
  selectItem: (i: RecordMetadata) => any
  forms: Record<string, FormMetadata>
  users: Record<string, Partial<UserType>>
}) {
  return (
    <Pressable
      p={2}
      flex={1}
      _hover={{ bg: 'coolGray.100' }}
      onPress={() => selectItem(item)}
    >
      <View style={[layout.hStack, layout.spaceBet, layout.width100percent]}>
        <View
          style={[layout.hStackGap4, layout.alignCenter, layout.width70percent]}
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
              {item.patientName || t('record.missing-patient-name')}
            </Text>
            {item.patientGender ? (
              <Text
                style={[
                  styleS.truncated,
                  styleS.pl3,
                  styleS.fontSizeSm,
                  styleS.colorCoolGray900,
                ]}
              >
                {t('gender.' + item.patientGender)}
              </Text>
            ) : (
              <></>
            )}
            {item.patientDateOfBirth > new Date('January 01 1500') ? (
              <Text
                style={[
                  styleS.truncated,
                  styleS.pl3,
                  styleS.fontSizeSm,
                  styleS.colorCoolGray900,
                ]}
              >
                {formatDate(item.patientDateOfBirth, 'PPP') as string}
              </Text>
            ) : (
              <></>
            )}
            {item.patientAddress ? (
              <Text
                style={[
                  styleS.truncated,
                  styleS.pl3,
                  styleS.fontSizeSm,
                  styleS.colorCoolGray900,
                ]}
              >
                {item.patientAddress}
              </Text>
            ) : (
              <></>
            )}
            <Text
              style={[
                styleS.truncated,
                styleS.pl3,
                styleS.fontSizeSm,
                styleS.colorCoolGray900,
              ]}
            >
              {forms[item.formUUID]
                ? forms[item.formUUID].title
                : 'Unknown form'}
            </Text>
            {forms[item.formUUID] ? (
              _.filter(
                _.split(forms[item.formUUID].tags, ','),
                e => e !== ''
              ).map((s: string, n: number) => (
                <Text style={[styleS.truncated, styleS.pl3]} key={n}>
                  {t('tag.' + s)}
                </Text>
              ))
            ) : (
              <Text></Text>
            )}
          </View>
        </View>

        <View style={[layout.vStack, layout.width30percent]}>
          <Text
            style={[
              styleS.truncated,
              styleS.fontSizeSm,
              styleS.colorCoolGray900,
            ]}
          >
            {formatDate(item.lastChangedDate, 'PPP') as string}
          </Text>
          <Text style={[styleS.truncated]}>
            {userFullName(
              users[item.lastChangedByUUID],
              item.lastChangedByUUID
            )}
          </Text>
          <Text
            style={[
              styleS.truncated,
              styleS.fontSizeSm,
              styleS.colorCoolGray900,
            ]}
          >
            {item.recordID}
          </Text>
          {item.caseId ? <Text>item.caseId</Text> : <></>}
        </View>
      </View>
    </Pressable>
  )
}

export function ListItemDesktop({
  item,
  selectItem,
  forms,
  users,
}: {
  item: RecordMetadata
  selectItem: (i: RecordMetadata) => any
  forms: Record<string, FormMetadata>
  users: Record<string, Partial<UserType>>
}) {
  return (
    <Pressable
      px={2}
      flex={1}
      _hover={{ bg: 'coolGray.100' }}
      onPress={() => selectItem(item)}
    >
      <View
        style={[
          layout.hStack,
          layout.flex1,
          layout.alignCenter,
          layout.spaceBet,
        ]}
      >
        <View style={[layout.vStack, layout.width45percent]}>
          <Text>
            {forms[item.formUUID] ? forms[item.formUUID].title : 'Unknown form'}
          </Text>
          <Text>{item.recordID}</Text>
        </View>

        <View style={[layout.vStack, layout.width20percent]}>
          <Text>
            {forms[item.formUUID]
              ? forms[item.formUUID]['official-name'] +
                ' ' +
                forms[item.formUUID]['official-code']
              : 'Unknown form'}
          </Text>
          <Text>{item.caseId ? item.caseId : ''}</Text>
          <Text>{item.formID}</Text>
        </View>

        <View style={[layout.vStack, layout.width20percent]}>
          <Text style={[styleS.truncated]}>
            {formatDate(item.lastChangedDate, 'PPP') as string}
          </Text>
          <Text style={[styleS.truncated]}>
            {userFullName(
              users[item.lastChangedByUUID],
              item.lastChangedByUUID
            )}
          </Text>
        </View>

        <View style={[layout.vStack, layout.width5percent]}>
          {item.sealed ? (
            <Icon fill="success" size="6" name="star" />
          ) : (
            <Icon fill="danger" size="6" name="star-outline" />
          )}
        </View>
      </View>
    </Pressable>
  )
}

export default function RecordListStaticComponent({
  records,
  selectItem,
}: {
  records: RecordMetadata[]
  selectItem: (f: RecordMetadata) => any
}) {
  const [forms, setForms] = useState({} as Record<string, FormMetadata>)
  const [users, setUsers] = useState({} as Record<string, Partial<UserType>>)

  useEffect(() => {
    async function recordsFn() {
      const loadedForms = {} as Record<string, FormMetadata>
      await Promise.all(
        _.map(_.uniq(_.map(records, r => r.formUUID)), async formUUID => {
          const result = await getFormCached(formUUID, () => null)
          if (result) loadedForms[formUUID] = result.metadata
          return result
        })
      )
      setForms(loadedForms)
    }
    async function usersFn() {
      const loadedUsers = {} as Record<string, Partial<UserType>>
      await Promise.all(
        _.map(
          _.uniq(
            _.concat(
              _.map(records, r => r.createdByUUID),
              _.map(records, r => r.lastChangedByUUID)
            )
          ),
          async userUUID => {
            const result = await getUserByUUIDCached(
              'Provider',
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
    recordsFn()
    usersFn()
  }, [records])

  return (
    <View
      style={[layout.vStack]}
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
      <View>
        <ScrollView>
          <View
            style={{ position: 'relative', display: isWider ? 'none' : 'flex' }}
          >
            {records.map((item: RecordMetadata, index: number) => {
              return (
                <ListItemMobile
                  item={item}
                  key={index}
                  selectItem={selectItem}
                  forms={forms}
                  users={users}
                />
              )
            })}
          </View>
          <View style={{ display: isWider ? 'flex' : 'none' }}>
            <View style={[layout.vStackGap3, spacing.mt3]}>
              {records.map((item: RecordMetadata, index: number) => {
                return (
                  <ListItemDesktop
                    item={item}
                    key={index}
                    selectItem={selectItem}
                    forms={forms}
                    users={users}
                  />
                )
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}
