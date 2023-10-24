import React from 'react'
import { Stack, Pressable, Center, Checkbox } from 'native-base'
import { Text } from '@ui-kitten/components'
import { StyleSheet, View } from 'react-native'
import _ from 'lodash'
import { t } from 'i18n-js'
import { layout } from 'components/styles'

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
      zIndex={absolutePositioning ? 100 : undefined}
      position={absolutePositioning ? 'absolute' : undefined}
      right={absolutePositioning ? '0' : undefined}
      px={absolutePositioning ? '1' : undefined}
      py={absolutePositioning ? '1' : undefined}
      onPress={toggleSkip}
      isDisabled={isDisabled}
    >
      <Stack direction={direction}>
        <View style={[layout.center]}>
          <Checkbox
            value="skip"
            isChecked={skipped}
            style={styles.checkbox}
            size="sm"
            accessibilityLabel={t('form.skip-question')}
          />
        </View>
        <View style={[layout.center]}>
          <Text
            style={{
              paddingLeft: direction === 'row' ? 4 : 0,
              paddingTop: direction === 'column' ? 4 : 0,
            }}
          >
            SKIP
          </Text>
        </View>
      </Stack>
    </Pressable>
  )
}
