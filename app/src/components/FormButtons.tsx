import React from 'react'
import {
  Box,
  HStack,
  Pressable,
  Icon,
  Text,
  Button,
  Badge,
  useBreakpointValue,
  FlatList,
  Stack,
  VStack,
  Tooltip,
} from 'native-base'
import { AntDesign, Feather } from '@expo/vector-icons'
import _ from 'lodash'
import { t } from 'i18n-js'

export default function FormButtons({
  isSectionCompleteList,
  onExit,
  onSaveAndExit,
  onSave,
  onCompleteRecord,
  onPrint,
  onAddRecord,
  onUpgrade,
  changed,
  isSealed,
  hasAssociatedForms,
}: {
  isSectionCompleteList: boolean[]
  onExit: () => any
  onSaveAndExit: () => any
  onSave: () => any
  onCompleteRecord: () => any
  onPrint: () => any
  onAddRecord?: () => any
  onUpgrade?: () => any
  changed: boolean
  isSealed: boolean
  hasAssociatedForms: boolean
}) {
  const stackDirection = useBreakpointValue({
    base: 'column',
    sm: 'row',
  })
  return (
    <VStack>
      {!changed && onAddRecord && onUpgrade ? (
        <Stack
          pt="3"
          direction={stackDirection}
          space="2"
          justifyContent="center"
          bg="white"
          key="header1"
        >
          <Tooltip label={t('record.buttons.tooltip-associated-form')}>
            <Button
              bg={hasAssociatedForms ? 'info.500' : 'muted.200'}
              leftIcon={<Icon as={Feather} name="plus-square" size="sm" />}
              onPress={onAddRecord}
              _text={{ selectable: false }}
              disabled={!hasAssociatedForms}
            >
              {hasAssociatedForms
                ? t('record.buttons.fill-associated-form')
                : t('record.buttons.no-associated-form')}
            </Button>
          </Tooltip>
          {!isSealed && (
            <Button
              leftIcon={<Icon as={Feather} name="alert-triangle" size="sm" />}
              bg="error.500"
              onPress={onUpgrade}
              _text={{ selectable: false }}
            >
              {t('record.buttons.upgrade-form')}
            </Button>
          )}
        </Stack>
      ) : (
        <></>
      )}
      <Stack
        py="3"
        direction={stackDirection}
        space="2"
        justifyContent="center"
        bg="white"
        key="header2"
      >
        {changed ? (
          <HStack space="2" justifyContent="center">
            <Button
              bg="info.500"
              leftIcon={<Icon as={AntDesign} name="save" size="sm" />}
              onPress={onSaveAndExit}
              _text={{ selectable: false }}
            >
              {t('record.buttons.save-and-exit')}
            </Button>
            <Button
              bg="info.500"
              leftIcon={<Icon as={AntDesign} name="save" size="sm" />}
              onPress={onSave}
              _text={{ selectable: false }}
            >
              {t('record.buttons.save')}
            </Button>
            <Button
              leftIcon={<Icon as={AntDesign} name="close" size="sm" />}
              bg="info.500"
              onPress={onExit}
              _text={{ selectable: false }}
            >
              {t('record.buttons.cancel')}
            </Button>
          </HStack>
        ) : (
          <Button
            leftIcon={<Icon as={Feather} name="arrow-left" size="sm" />}
            bg="info.500"
            onPress={onExit}
            _text={{ selectable: false }}
          >
            {t('record.buttons.exit')}
          </Button>
        )}
        {!changed && (
          <HStack space="2" justifyContent="center">
            <Button
              bg="info.500"
              leftIcon={<Icon as={AntDesign} name="printer" size="sm" />}
              onPress={onPrint}
              _text={{ selectable: false }}
            >
              {t('record.buttons.print')}
            </Button>
            {!isSealed && (
              <Button
                bg={
                  _.every(isSectionCompleteList, (a: boolean) => a)
                    ? 'success.600'
                    : 'primary.800'
                }
                leftIcon={<Icon as={AntDesign} name="staro" size="sm" />}
                onPress={onCompleteRecord}
                _text={{ selectable: false }}
              >
                {t('record.buttons.complete-record')}
              </Button>
            )}
          </HStack>
        )}
      </Stack>
    </VStack>
  )
}
