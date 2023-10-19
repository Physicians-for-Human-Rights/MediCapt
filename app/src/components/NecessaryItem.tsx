import React from 'react'
import {
  HStack,
  CheckIcon,
  CloseIcon,
  WarningTwoIcon,
  Popover,
} from 'native-base'
import { Button, Text, useStyleSheet } from '@ui-kitten/components'
import _ from 'lodash'
import themedStyles from 'themeStyled'

const styleS = useStyleSheet(themedStyles)

export default function NecessaryItem({
  todoText,
  doneText,
  size = 4,
  mx = 4,
  isDone,
  optional = false,
  helpHeader,
  help,
}: {
  todoText: string
  doneText: string
  size?: number | string
  mx?: number | string
  isDone: boolean
  optional?: boolean
  helpHeader?: string
  help?: string
}) {
  if (isDone) {
    return (
      <HStack space={0} alignItems="center">
        <CheckIcon size={size} mx={mx} color="emerald.500" />
        <Text>{doneText}</Text>
      </HStack>
    )
  } else {
    const Icon = optional ? WarningTwoIcon : CloseIcon
    return (
      <HStack space={0} alignItems="center">
        <Icon
          size={size}
          mx={mx}
          color={optional ? 'warning.500' : 'error.500'}
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
