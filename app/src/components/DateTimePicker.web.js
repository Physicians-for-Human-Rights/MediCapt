import React, { useState } from 'react'
import { HStack, IconButton, Input, Center, Modal } from 'native-base'
import _ from 'lodash'
import { AntDesign } from '@expo/vector-icons'
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import { disabledBackground } from 'utils/formRendering/utils'
import FloatingLabelInput from 'components/FloatingLabelInput'

import 'react-datepicker/dist/react-datepicker.css'
import DatePicker from 'react-datepicker'
import { parseDate } from 'chrono-node'

export default function DateTimePicker({
  title,
  date,
  open,
  close,
  setDate,
  time,
  isDisabled,
  fancyLabel = undefined,
}) {
  const formatString = time ? 'yyyy-MM-dd h:mm a' : 'yyyy-MM-dd'
  const [modalVisible, setModalVisible] = useState(false)
  const [dateString, setDateString] = useState(
    _.isDate(date) ? formatDate(date, formatString) : ''
  )

  const openInternal = () => {
    setModalVisible(true)
    open()
  }

  const onSave = date => {
    setDate(date)
    const dateString = formatDate(date, formatString)
    setDateString(dateString)
    setModalVisible(false)
    close()
  }

  const onSaveRawText = text => {
    try {
      const date = parseDate(text)
      if (isNaN(date.valueOf())) {
        setDate(null)
        setDateString('')
      } else {
        setDate(date)
        setDateString(formatDate(date, formatString))
      }
    } catch (e) {
      // TODO This should clear the field, particularly when the fancyLabel
      // setting is used; happens when the date is invalid
      console.error('Failed to parse', e)
      setDate(null)
      setDateString('')
    }
    setModalVisible(false)
    close()
  }

  const onSaveText = () => {
    onSaveRawText(dateString)
  }

  const onClose = () => {
    setModalVisible(false)
    close()
  }

  return (
    <>
      <Center bg={isDisabled ? disabledBackground : undefined}>
        <HStack>
          {fancyLabel ? (
            <FloatingLabelInput
              label={fancyLabel}
              value={dateString}
              setValue={v => {
                setDateString(v)
                onSaveRawText(v)
              }}
              placeholder={'YYYY-MM-DD'}
            />
          ) : (
            <Input
              isDisabled={isDisabled}
              mx="3"
              size="md"
              placeholder={t(time ? 'form.enter-date-time' : 'form.enter-date')}
              w="75%"
              maxWidth="200px"
              onChangeText={setDateString}
              value={dateString}
              onSubmitEditing={onSaveText}
              onEndEditing={onSaveText}
              accessibilityLabel={t(
                time ? 'form.enter-date-time' : 'form.enter-date'
              )}
            />
          )}
          <Center>
            <IconButton
              isDisabled={isDisabled}
              onPress={openInternal}
              size="sm"
              mt={fancyLabel ? 2 : 0}
              colorScheme="indigo"
              variant="solid"
              _icon={{
                as: AntDesign,
                name: 'calendar',
              }}
              accessibilityLabel={'Open calendar'}
            />
          </Center>
        </HStack>
      </Center>
      <Modal isOpen={modalVisible} onClose={onClose}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>{title}</Modal.Header>
          <Modal.Body>
            <Center>
              <DatePicker
                selected={date}
                onChange={onSave}
                inline
                fixedHeight
                showYearDropdown={fancyLabel ? true : false}
              />
            </Center>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}
