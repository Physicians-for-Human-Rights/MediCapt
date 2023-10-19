import React from 'react'
import {
  Center,
  HStack,
  useBreakpointValue,
  FlatList,
  Stack,
  VStack,
  Tooltip,
} from 'native-base'
import _ from 'lodash'
import { t } from 'i18n-js'
import { Button } from '@ui-kitten/components'
import { colors } from './nativeBaseSpec'
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
  hasAssociatedForms,
  topSpace = '3',
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
  hasAssociatedForms: boolean
  topSpace?: string
  readOnly: boolean
}) {
  const stackDirection = useBreakpointValue({
    base: 'column',
    sm: 'row',
  })

  return (
    <VStack>
      <Stack
        pt={topSpace}
        pb="3"
        direction={stackDirection}
        space="2"
        justifyContent="center"
        bg="white"
        key="header2"
      >
        {changed ? (
          <HStack space="2" justifyContent="center">
            <Button
              status="info"
              accessoryLeft={SaveIcon}
              onPress={onSaveAndExit}
            >
              {t('record.buttons.save-and-exit')}
            </Button>
            <Button status="info" accessoryLeft={SaveIcon} onPress={onSave}>
              {t('record.buttons.save')}
            </Button>
            <Button accessoryLeft={CloseIcon} status="info" onPress={onExit}>
              {t('record.buttons.cancel')}
            </Button>
          </HStack>
        ) : (
          <Button
            accessoryLeft={ArrowLeftIcon}
            status="info"
            onPress={onExit}
            // _text={{ selectable: false }}
          >
            {t('record.buttons.exit')}
          </Button>
        )}
        {!changed && (
          <HStack space="2" justifyContent="center">
            <Button
              status="info"
              accessoryLeft={PrinterIcon}
              onPress={onPrint}
              // _text={{ selectable: false }}
            >
              {t('record.buttons.print')}
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
                // accessoryLeft={<Icon as={AntDesign} name="staro" size="sm" />}
                onPress={onCompleteRecord}
                // _text={{ selectable: false }}
              >
                {t('record.buttons.complete-record')}
              </Button>
            )}
          </HStack>
        )}
      </Stack>
      {!isSealed && !readOnly && onUpgrade && (
        <Center>
          <Button
            accessoryLeft={AlertIcon}
            status="danger"
            onPress={onUpgrade}
            // _text={{ selectable: false }}
          >
            {t('record.buttons.upgrade-form')}
          </Button>
        </Center>
      )}
      {!changed && onAddRecord && onShareRecord ? (
        <Stack
          py="3"
          direction={stackDirection}
          space="2"
          justifyContent="center"
          bg="white"
          key="header1"
        >
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
              ? t('record.buttons.fill-associated-form')
              : t('record.buttons.no-associated-form')}
          </Button>
          <Button
            status="info"
            accessoryLeft={ShareIcon}
            onPress={onShareRecord}
            // _text={{ selectable: false }}
          >
            {t('record.buttons.share-record')}
          </Button>
        </Stack>
      ) : (
        <></>
      )}
    </VStack>
  )
}
