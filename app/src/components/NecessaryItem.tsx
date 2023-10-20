import React from 'react'
import { HStack, Popover } from 'native-base'
import { Button, Text, useStyleSheet, Icon } from '@ui-kitten/components'
import _ from 'lodash'
import themedStyles from 'themeStyled'

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
      <HStack space={0} alignItems="center">
        <Icon
          size={size}
          fill="success"
          name="checkmark-outline"
          style={{ marginHorizontal: +mx * 4 }}
        />
        {/* <CheckIcon size={size} mx={mx} /> */}
        <Text>{doneText}</Text>
      </HStack>
    )
  } else {
    // const Icon = optional ? WarningTwoIcon : CloseIcon
    return (
      <HStack space={0} alignItems="center">
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
      </HStack>
    )
  }
}
