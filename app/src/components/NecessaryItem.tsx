import React from 'react'
import { Popover } from 'native-base'
import { Button, Text, useStyleSheet, Icon } from '@ui-kitten/components'
import _ from 'lodash'
import themedStyles from 'themeStyled'
import { layout } from './styles'
import { View } from 'react-native'

const styleS = useStyleSheet(themedStyles)

export default function NecessaryItem({
  todoText,
  doneText,
  size = 'tiny',
  mx = 4,
  isDone,
  optional = false,
  helpHeader,
  help,
}: {
  todoText: string
  doneText: string
  size?: string
  mx?: number | string
  isDone: boolean
  optional?: boolean
  helpHeader?: string
  help?: string
}) {
  if (isDone) {
    return (
      <View style={[layout.hStack, layout.alignCenter]}>
        <Icon
          size={size}
          fill="success"
          name="checkmark-outline"
          style={{ marginHorizontal: +mx * 4 }}
        />
        {/* <CheckIcon size={size} mx={mx} /> */}
        <Text>{doneText}</Text>
      </View>
    )
  } else {
    // const Icon = optional ? WarningTwoIcon : CloseIcon
    return (
      <View style={[layout.hStack, layout.alignCenter]}>
        <Icon
          size={size}
          style={{ marginHorizontal: +mx * 4 }}
          fill={optional ? 'warning' : 'danger'}
          name={optional ? 'alert-triangle' : 'close'}
        />
        <Text status={optional ? 'warning' : 'error'}>{todoText}</Text>
        {help && (
          <Popover
            trigger={triggerProps => {
              return (
                <Button
                  {...triggerProps}
                  appearance="ghost"
                  status="secondary"
                  style={[styleS.ml5, styleS.p0]}
                  size="sm"
                >
                  Tell me more
                </Button>
              )
            }}
          >
            <Popover.Content accessibilityLabel={'help for' + todoText} w="64">
              <Popover.Arrow />
              <Popover.CloseButton />
              <Popover.Header>
                {helpHeader ? helpHeader : 'Help'}
              </Popover.Header>
              <Popover.Body>{help}</Popover.Body>
            </Popover.Content>
          </Popover>
        )}
      </View>
    )
  }
}
