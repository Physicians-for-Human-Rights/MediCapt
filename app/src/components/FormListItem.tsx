import React from 'react'
import { Pressable } from 'react-native'
import { Text, useStyleSheet } from '@ui-kitten/components'
import themedStyles from '../themeStyled'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import _ from 'lodash'
import { FormMetadata } from 'utils/types/formMetadata'
import { View } from 'react-native'
import { layout } from './styles'

const FormListItem = ({
  item,
  selectItem,
}: {
  item: FormMetadata
  selectItem: (i: FormMetadata) => any
}) => {
  const styleS = useStyleSheet(themedStyles)
  return (
    <Pressable style={{ padding: 8 }} onPress={() => selectItem(item)}>
      <View style={[layout.hStack, layout.spaceBet, layout.width100percent]}>
        <View
          style={[layout.hStackGap4, layout.alignCenter, layout.width70percent]}
        >
          <View style={layout.vStack}>
            <Text
              style={[
                styleS.truncated,
                styleS.fontBold,
                styleS.fontSizeSm,
                styleS.colorCoolGray900,
              ]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styleS.truncated,
                styleS.fontSizeSm,
                styleS.colorCoolGray900,
                styleS.pl3,
              ]}
            >
              {item.subtitle}
            </Text>
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
            {formatDate(item.createdDate, 'PPP') as string}
          </Text>
          <Text
            style={[
              styleS.truncated,
              styleS.fontSizeSm,
              styleS.colorCoolGray900,
            ]}
          >
            {item.formID}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

export default FormListItem
