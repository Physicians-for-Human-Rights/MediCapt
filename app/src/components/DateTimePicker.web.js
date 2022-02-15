import React, { useState } from 'react'
import {
  Box,
  VStack,
  StatusBar,
  ScrollView,
  HStack,
  Pressable,
  // Icon,
  // Image,
  Text,
  Hidden,
  useColorMode,
  IconButton,
  Divider,
  Menu,
  Avatar,
  Button,
  Input,
  Center,
  useBreakpointValue,
  Modal,
  View,
} from 'native-base'
import _ from 'lodash'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'
import formatDate from 'utils/date.ts'

import 'react-datepicker/dist/react-datepicker.css'
import DatePicker from 'react-datepicker'
import { parse as dateParser } from 'date-fns'

export default function DateTimePicker({ title, date, open, close, setDate }) {
  const [modalVisible, setModalVisible] = useState(false)
  const [dateString, setDateString] = useState(
    _.isDate(date) ? formatDate(date, 'yyyy-MM-dd') : ''
  )

  const openInternal = () => {
    setModalVisible(true)
    open()
  }

  const onSave = date => {
    setDate(date)
    const dateString = formatDate(date, 'yyyy-MM-dd')
    setDateString(dateString)
    setModalVisible(false)
    close()
  }

  const onSaveText = () => {
    try {
      const date = dateParser(dateString, 'yyyy-MM-dd', new Date())
      if (isNaN(date.valueOf())) {
        setDate(null)
        setDateString('')
      } else {
        setDate(date)
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
            placeholder="Enter date"
            w="75%"
            maxWidth="200px"
            onChangeText={setDateString}
            value={dateString}
            onSubmitEditing={onSaveText}
            onEndEditing={onSaveText}
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
