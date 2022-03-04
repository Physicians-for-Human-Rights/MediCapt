import React, { useState } from 'react'
import { HStack, IconButton, Input, Center, Modal } from 'native-base'
import _ from 'lodash'
import { AntDesign } from '@expo/vector-icons'
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'

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

  const onSaveText = () => {
    try {
      const date = parseDate(dateString)
      if (isNaN(date.valueOf())) {
        setDate(null)
        setDateString('')
      } else {
        setDate(date)
        setDateString(formatDate(date, formatString))
      }
    } catch (e) {
      setDate(null)
      setDateString('')
    }
    setModalVisible(false)
    close()
  }

  const onClose = () => {
    setModalVisible(false)
    close()
  }

  return (
    <>
      <Center>
        <HStack>
          <Input
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
          <IconButton
            onPress={openInternal}
            size="sm"
            colorScheme="indigo"
            variant="solid"
            _icon={{
              as: AntDesign,
              name: 'calendar',
            }}
            accessibilityLabel={'Open calendar'}
          />
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
              />
            </Center>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}
