import React from 'react'
import {
  Button,
  Text,
  useStyleSheet,
  Icon,
  Popover,
  Card,
} from '@ui-kitten/components'
import _ from 'lodash'
import themedStyles from '../themeStyled'
import { layout } from './styles'
import { View } from 'react-native'
import ModalHeader from './styledComponents/ModalHeader'
import i18n from 'i18n'

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
  const styleS = useStyleSheet(themedStyles)
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
            anchor={triggerProps => {
              return (
                <Button
                  {...triggerProps}
                  appearance="ghost"
                  status="secondary"
                  style={[styleS.ml5, styleS.p0]}
                  size="sm"
                >
                  {i18n.t('general.tellMeMore')}
                </Button>
              )
            }}
          >
            <Card
              style={{ width: 64 }}
              aria-label={'help for' + todoText}
              header={props => (
                <ModalHeader
                  {...props}
                  text={helpHeader ? helpHeader : 'Help'}
                />
              )}
            >
              {help}
            </Card>
          </Popover>
        )}
      </View>
    )
  }
}
