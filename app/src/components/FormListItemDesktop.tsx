import React from 'react'
import { Pressable } from 'react-native'
import { Text, useStyleSheet, Icon } from '@ui-kitten/components'
import themedStyles from '../themeStyled'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { useStoreState } from '../utils/store'
import _ from 'lodash'
import { FormMetadata } from 'utils/types/formMetadata'
import { View } from 'react-native'
import { layout, spacing } from './styles'

const FormListItemDesktop = ({
  item,
  selectItem,
}: {
  item: FormMetadata
  selectItem: (i: FormMetadata) => any
}) => {
  const state = useStoreState()
  const i18n = state?.i18n
  const styleS = useStyleSheet(themedStyles)
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
          <Text style={[styleS.fontBold, styleS.truncated]}>{item.title}</Text>
          <Text style={[styleS.ml2, styleS.truncated]}>{item.subtitle}</Text>
        </View>

        <View style={[layout.vStack, layout.width20percent]}>
          {_.split(item.tags, ',').map((s: string, n: number) => (
            <Text style={[styleS.truncated]} key={n}>
              {i18n.t('tag.' + s)}
            </Text>
          ))}
          <Text>{item.formID}</Text>
        </View>

        <View style={[layout.vStack, layout.width20percent]}>
          <Text style={[styleS.truncated]}>
            {formatDate(item.lastChangedDate, 'PPP') as string}
          </Text>
        </View>

        <View style={[layout.hStack, layout.width5percent]}>
          {item.enabled ? (
            <Icon fill="success" size="6" name="check-circle" pack="material" />
          ) : (
            <Icon fill="error" size="6" name="cancel" pack="material" />
          )}
        </View>
      </View>
    </Pressable>
  )
}

export default FormListItemDesktop
