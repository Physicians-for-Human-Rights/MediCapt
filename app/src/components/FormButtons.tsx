import React from 'react'
import _ from 'lodash'
import { useStoreState } from '../utils/store'
import { Button } from '@ui-kitten/components'
import { breakpoints, colors } from './nativeBaseSpec'
import {
  CloseIcon,
  SaveIcon,
  ShareIcon,
  PlusIcon,
  AlertIcon,
  PrinterIcon,
  StarIcon,
  ArrowLeftIcon,
} from './Icons'
import { View, Dimensions, StyleSheet } from 'react-native'
import { layout } from './styles'

const { width } = Dimensions.get('window')

export default function FormButtons({
  isSectionCompleteList,
  onExit,
  onSaveAndExit,
  onSave,
  onCompleteRecord,
  onPrint,
  onAddRecord,
  onShareRecord,
  onUpgrade,
  changed,
  isSealed,
  hasAssociatedForms = false,
  topSpace = 3,
  readOnly,
}: {
  isSectionCompleteList: boolean[]
  onExit: () => any
  onSaveAndExit: () => any
  onSave: () => any
  onCompleteRecord: () => any
  onPrint: () => any
  onAddRecord?: () => any
  onShareRecord?: () => any
  onUpgrade?: () => any
  changed: boolean
  isSealed: boolean
  hasAssociatedForms?: boolean
  topSpace?: number
  readOnly: boolean
}) {
  const state = useStoreState()
  const i18n = state?.i18n
  const direction = width > breakpoints.sm ? 'row' : 'column'
  const localStyle = StyleSheet.create({
    container: {
      justifyContent: 'center',
      flexDirection: direction,
      paddingTop: topSpace,
      paddingBottom: 12,
      gap: 8,
      backgroundColor: 'white',
    },
    containerMiddle: {
      justifyContent: 'center',
      flexDirection: direction,
      paddingVertical: 12,
      gap: 8,
      backgroundColor: 'white',
    },
  })
  return (
    <View style={layout.vStack}>
      <View style={localStyle.container} key="header2">
        {changed ? (
          <View style={[layout.hStackGap2, layout.justifyCenter]}>
            <Button
              status="info"
              accessoryLeft={SaveIcon}
              onPress={onSaveAndExit}
            >
              {i18n.t('record.buttons.save-and-exit')}
            </Button>
            <Button status="info" accessoryLeft={SaveIcon} onPress={onSave}>
              {i18n.t('buttons.save')}
            </Button>
            <Button accessoryLeft={CloseIcon} status="info" onPress={onExit}>
              {i18n.t('buttons.cancel')}
            </Button>
          </View>
        ) : (
          <Button
            accessoryLeft={ArrowLeftIcon}
            status="info"
            onPress={onExit}
            // _text={{ selectable: false }}
          >
            {i18n.t('record.buttons.exit')}
          </Button>
        )}
        {!changed && (
          <View style={[layout.hStackGap2, layout.justifyCenter]}>
            <Button
              status="info"
              accessoryLeft={PrinterIcon}
              onPress={onPrint}
              // _text={{ selectable: false }}
            >
              {i18n.t('record.buttons.print')}
            </Button>
            {!isSealed && !readOnly && (
              <Button
                style={{
                  backgroundColor: _.every(
                    isSectionCompleteList,
                    (a: boolean) => a
                  )
                    ? colors.success[600]
                    : colors.primary[800],
                }}
                accessoryLeft={StarIcon}
                onPress={onCompleteRecord}
                // _text={{ selectable: false }}
              >
                {i18n.t('record.buttons.complete-record')}
              </Button>
            )}
          </View>
        )}
      </View>
      {!isSealed && !readOnly && onUpgrade && (
        <View style={layout.center}>
          <Button
            accessoryLeft={AlertIcon}
            status="danger"
            onPress={onUpgrade}
            // _text={{ selectable: false }}
          >
            {i18n.t('record.buttons.upgrade-form')}
          </Button>
        </View>
      )}
      {!changed && onAddRecord && onShareRecord ? (
        <View style={localStyle.containerMiddle} key="header1">
          <Button
            style={{
              backgroundColor: hasAssociatedForms
                ? colors.info[500]
                : colors.muted[200],
            }}
            accessoryLeft={PlusIcon}
            onPress={onAddRecord}
            // _text={{ selectable: false }}
            disabled={!hasAssociatedForms}
          >
            {hasAssociatedForms
              ? i18n.t('record.buttons.fill-associated-form')
              : i18n.t('record.buttons.no-associated-form')}
          </Button>
          <Button
            status="info"
            accessoryLeft={ShareIcon}
            onPress={onShareRecord}
            // _text={{ selectable: false }}
          >
            {i18n.t('record.buttons.share-record')}
          </Button>
        </View>
      ) : (
        <></>
      )}
    </View>
  )
}
