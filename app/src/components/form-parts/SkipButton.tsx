import React from 'react'
import { Pressable } from 'react-native'
import { Text, CheckBox } from '@ui-kitten/components'
import { StyleSheet, View } from 'react-native'
import _ from 'lodash'
import i18n from 'i18n'
import { layout } from '../styles'

const styles = StyleSheet.create({
  checkbox: {
    width: 13,
    height: 13,
  },
})

export default function SkipButton({
  skippable,
  skipped,
  toggleSkip,
  direction,
  absolutePositioning = false,
  isDisabled,
}: {
  skippable: boolean | null
  skipped: boolean
  toggleSkip: () => void
  direction: 'row' | 'column'
  absolutePositioning?: boolean
  isDisabled: boolean
}) {
  if (!skippable) {
    return <></>
  }

  return (
    <Pressable
      style={{
        zIndex: absolutePositioning ? 100 : undefined,
        // position: absolutePositioning ? 100 : undefined,
        right: absolutePositioning ? '0' : undefined,
        paddingHorizontal: absolutePositioning ? '1' : undefined,
        paddingVertical: absolutePositioning ? '1' : undefined,
      }}
      onPress={toggleSkip}
      disabled={isDisabled}
    >
      <View style={{ flexDirection: direction }}>
        <View style={[layout.center]}>
          <CheckBox
            // value="skip"
            checked={skipped}
            style={styles.checkbox}
            // size="small"
            aria-label={i18n.t('form.skip-question')}
          />
        </View>
        <View style={[layout.center]}>
          <Text
            style={{
              paddingLeft: direction === 'row' ? 4 : 0,
              paddingTop: direction === 'column' ? 4 : 0,
            }}
          >
            {i18n.t('general.skip')}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}
