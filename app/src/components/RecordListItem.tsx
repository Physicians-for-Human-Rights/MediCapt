import React, { useState, useEffect } from 'react'
import { Text, useStyleSheet, Icon } from '@ui-kitten/components'
import themedStyles from '../themeStyled'
// @ts-ignore Record some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { useStoreState } from '../utils/store'
import _ from 'lodash'
import { RecordMetadata } from 'utils/types/recordMetadata'
import { FormMetadata } from 'utils/types/formMetadata'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import SelectLocation from 'components/SelectLocation'
import { getFormCached, getUserByUUIDCached } from 'api/common'
import { UserType } from 'utils/types/user'
import { userFullName } from 'utils/userTypes'
import { Platform, View, Dimensions, ScrollView, Pressable } from 'react-native'
import { breakpoints } from './nativeBaseSpec'
import { colors } from './nativeBaseSpec'
import styles, { borders, layout, spacing } from './styles'

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
  const state = useStoreState()
  const i18n = state?.i18n
  const styleS = useStyleSheet(themedStyles)
  return (
    <Pressable
      style={[spacing.p2, layout.flex1]}
      // _hover={{ bg: 'coolGray.100' }}
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
              {item.patientName || i18n.t('record.missing-patient-name')}
            </Text>
            {item.patientGender && (
              <Text
                style={[
                  styleS.truncated,
                  styleS.pl3,
                  styleS.fontSizeSm,
                  styleS.colorCoolGray900,
                ]}
              >
                {i18n.t('gender.' + item.patientGender)}
              </Text>
            )}
            {item.patientDateOfBirth > new Date('January 01 1500') && (
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
            )}
            {item.patientAddress && (
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
            {forms[item.formUUID] &&
              _.filter(
                _.split(forms[item.formUUID].tags, ','),
                e => e !== ''
              ).map((s: string, n: number) => (
                <Text style={[styleS.truncated, styleS.pl3]} key={n}>
                  {i18n.t('tag.' + s)}
                </Text>
              ))}
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
          {item.caseId && <Text>item.caseId</Text>}
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
  const state = useStoreState()
  const i18n = state?.i18n
  const styleS = useStyleSheet(themedStyles)
  const patientDateOfBirth = formatDate(
    item.patientDateOfBirth,
    'PPP'
  ) as string
  return (
    <Pressable
      style={[spacing.px2, layout.flex1]}
      // _hover={{ bg: 'coolGray.100' }}
      onPress={() => selectItem(item)}
    >
      <View
        style={[
          layout.hStack,
          layout.alignCenter,
          layout.flex1,
          layout.spaceBet,
        ]}
      >
        <View style={[layout.vStack, layout.width45percent]}>
          <Text style={[styleS.truncated, styleS.fontBold]}>
            {item.patientName || i18n.t('record.missing-patient-name')}
          </Text>
          <Text style={[styleS.truncated, styleS.ml2]}>
            {item.patientGender ? i18n.t('gender.' + item.patientGender) : ''}
          </Text>
          {patientDateOfBirth &&
            item.patientDateOfBirth > new Date('January 01 1500') && (
              <Text style={[styleS.truncated, styleS.ml2]}>
                {patientDateOfBirth}
              </Text>
            )}
          <Text style={[styleS.truncated, styleS.ml2]}>
            {item.patientAddress ? item.patientAddress : ''}
          </Text>
          <Text>{item.recordID}</Text>
        </View>

        <View style={[layout.vStack, layout.width20percent]}>
          {forms &&
            forms[item.formUUID] &&
            _.filter(
              _.split(forms[item.formUUID].tags, ','),
              e => e !== ''
            ).map((s: string, n: number) => (
              <Text style={[styleS.truncated]} key={n}>
                {i18n.t('tag.' + s)}
              </Text>
            ))}
          <Text>
            {forms[item.formUUID] ? forms[item.formUUID].title : 'Unknown form'}
          </Text>
          <Text>
            {forms[item.formUUID]
              ? forms[item.formUUID]['official-name'] +
                ' ' +
                forms[item.formUUID]['official-code']
              : 'Unknown form'}
          </Text>
          <Text>{item.formID}</Text>
          <Text>{item.caseId ? item.caseId : ''}</Text>
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
          <Text style={[styleS.truncated]}>
            {formatDate(item.createdDate, 'PPP') as string}
          </Text>
          <Text style={[styleS.truncated]}>
            {userFullName(users[item.createdByUUID], item.createdByUUID)}
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
