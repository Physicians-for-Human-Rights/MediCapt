import React, { useState } from 'react'
import { ScrollView, Pressable } from 'native-base'
import { Text, useStyleSheet, Icon } from '@ui-kitten/components'
import themedStyles from 'themeStyled'
import { LocationType } from 'utils/types/location'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { View, Dimensions } from 'react-native'
import { breakpoints } from './nativeBaseSpec'
import styles, { layout, spacing } from './styles'

const { width } = Dimensions.get('window')
const styleS = useStyleSheet(themedStyles)
const isWider = width > breakpoints.md

export function ListItem({ item }: { item: LocationType }) {
  return (
    <Pressable p={2} borderBottomWidth={0.8} borderBottomColor="coolGray.300">
      <View style={[layout.hStack, layout.spaceBet, layout.width100percent]}>
        <View
          style={[layout.alignCenter, layout.hStackGap4, layout.width55percent]}
        >
          <View style={[layout.vStack]}>
            <Text
              style={[
                styleS.truncated,
                styleS.fontBold,
                styleS.fontSizeSm,
                styleS.maxWidth64x4,
                styleS.colorCoolGray900,
              ]}
              numberOfLines={2}
            >
              {item.legalName}
            </Text>
            <View style={[layout.hStack]}>
              <Text
                style={[
                  styleS.truncated,
                  styleS.fontSizeSm,
                  styleS.pl3,
                  styleS.colorCoolGray600,
                ]}
              >
                {t('location.entity.' + item.entityType)}
              </Text>
              <Text
                style={[styleS.truncated, styleS.ml2, styleS.colorCoolGray600]}
              >
                {t('country.' + item.country)}
              </Text>
            </View>
            <Text
              style={[
                styleS.truncated,
                styleS.pl3,
                styleS.colorCoolGray700,
                styleS.fontSizeSm,
              ]}
            >
              {formatDate(item.lastChangedDate, 'PPP') as string}
            </Text>
          </View>
        </View>
        <View
          style={[layout.hStackGap4, layout.alignCenter, layout.width32percent]}
        >
          <View style={[layout.vStack]}>
            <Text
              style={[
                styleS.truncated,
                styleS.maxWidth100Percent,
                styleS.colorCoolGray900,
                styleS.fontSizeXs,
              ]}
            >
              {item.shortName}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.maxWidth100Percent,
                styleS.fontSizeXs,
                styleS.colorCoolGray900,
              ]}
            >
              {item.locationID}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.maxWidth100Percent,
                styleS.fontSizeXs,
                styleS.colorCoolGray500,
              ]}
            >
              {formatDate(item.createdDate, 'PPP') as string}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.maxWidth60Percent,
                styleS.fontSizeXs,
                styleS.colorCoolGray500,
              ]}
            >
              {item.enabled}
            </Text>
          </View>
        </View>
        <View style={[layout.hStack, layout.width5percent]}>
          {item.enabled ? (
            <Icon fill="success" size="6" name="check-circle" pack="material" />
          ) : (
            <Icon fill="danger" size="6" name="cancel" pack="material" />
          )}
        </View>
      </View>
    </Pressable>
  )
}

export function ListItemDesktop({
  item,
  selectItem,
}: {
  item: LocationType | string
  selectItem: (location: LocationType) => any
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
          layout.alignCenter,
          layout.flex1,
          layout.spaceBet,
        ]}
      >
        <View style={[layout.vStack, layout.width30percent]}>
          <Text style={[styleS.fontBold, styleS.truncated]} numberOfLines={2}>
            {_.isString(item) ? item : item.legalName}
          </Text>
          {!_.isString(item) && (
            <View
              style={[
                layout.hStack,
                layout.alignCenter,
                layout.justifyStart,
                layout.flex1,
              ]}
            >
              <Text style={[styleS.ml2, styleS.truncated]}>
                {item.shortName}
              </Text>
            </View>
          )}
          {!_.isString(item) && (
            <Text style={[styleS.ml2, styleS.truncated]}>
              {t('location.entity.' + item.entityType)}
            </Text>
          )}
        </View>

        <View style={[layout.vStack, layout.width20percent]}>
          {!_.isString(item) && (
            <Text style={[styleS.truncated]}>
              {t('country.' + item.country)}
            </Text>
          )}
          {!_.isString(item) && (
            <Text style={[styleS.truncated]}>
              {t('languages.' + item.language)}
            </Text>
          )}
        </View>

        <View style={[layout.vStack, layout.width30percent]}>
          {!_.isString(item) && (
            <Text style={[styleS.truncated]}>
              {formatDate(item.lastChangedDate, 'PPP') as string}
            </Text>
          )}
          {!_.isString(item) && (
            <Text style={[styleS.truncated]}>{item.locationID}</Text>
          )}
        </View>

        <View style={[layout.hStack, layout.width5percent]}>
          <Icon fill="danger" size="6" name="delete" pack="material" />
        </View>
      </View>
    </Pressable>
  )
}

export default function LocationListStatic({
  locations,
  selectItem,
}: {
  locations: (LocationType | string)[]
  selectItem: (location: LocationType) => any
}) {
  return (
    <>
      <View
        style={[
          styles.locationListVStack,
          isWider ? styles.locationListVStackMd : styles.locationListVStackBase,
        ]}
      >
        <View>
          <View style={[layout.center]}>
            <Text category="h5">Allowed locations</Text>
          </View>
          <ScrollView>
            <View
              style={{
                position: 'relative',
                display: isWider ? 'none' : 'flex',
              }}
            >
              {locations.map((item: LocationType | string, index: number) => {
                return <ListItem item={item} key={index} />
              })}
            </View>
            <View style={{ display: isWider ? 'flex' : 'none' }}>
              <View style={[layout.vStackGap3, spacing.mt3]}>
                {locations.map((item: LocationType | string, index: number) => {
                  return (
                    <ListItemDesktop
                      item={item}
                      key={index}
                      selectItem={selectItem}
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
