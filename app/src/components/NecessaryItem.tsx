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
import { View, StyleSheet } from 'react-native'
import ModalHeader from './styledComponents/ModalHeader'
import { useStoreState } from '../utils/store'

export default function NecessaryItem({
  todoText,
  doneText,
  size = 'small',
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
  const state = useStoreState()
  const i18n = state?.i18n
  const styleS = useStyleSheet(themedStyles)
  const styles = StyleSheet.create({
    icon: {
      width: 24,
      height: 24,
    },
  })
  if (isDone) {
    return (
      <View style={[layout.hStack, layout.alignCenter]}>
        <Icon
          fill="#52af1f"
          name="check"
          style={[styles.icon, { marginHorizontal: +mx * 4 }]}
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
          style={[styles.icon, { marginHorizontal: +mx * 4 }]}
          fill={optional ? 'warning' : 'danger'}
          name={optional ? 'warning' : 'close'}
        />
        <Text status={optional ? 'warning' : 'error'}>{todoText}</Text>
        {help && (
          <Popover
            anchor={triggerProps => {
              return (
                <Button
                  // {...triggerProps}
                  appearance="outline"
                  status="info"
                  style={[styleS.ml5, styleS.p0]}
                  size="medium"
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
