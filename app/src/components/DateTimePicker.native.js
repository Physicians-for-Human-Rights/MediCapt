import React, { useState } from 'react'
import Picker from 'react-native-modal-datetime-picker'
import { t } from 'i18n-js'

import { Button } from 'native-base'
import _ from 'lodash'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'

export default function DateTimePicker({
  title,
  date,
  open,
  close,
  setDate,
  time,
  isDisabled,
}) {
  const [modalVisible, setModalVisible] = useState(false)

  const openInternal = () => {
    setModalVisible(true)
    open()
  }

  const onSave = d => {
    setDate(d)
    setModalVisible(false)
    close()
  }

  const onClose = () => {
    setModalVisible(false)
    close()
  }

  return (
    <>
      <Button
        isDisabled={isDisabled}
        onPress={openInternal}
        bg={_.isDate(date) ? 'success.600' : 'primary.800'}
        accessibilityLabel={t(
          time ? 'form.enter-date-time' : 'form.enter-date'
        )}
      >
        {date
          ? time
            ? date.toLocaleString()
            : date.toLocaleDateString()
          : t(time ? 'form.enter-date-time' : 'form.enter-date')}
      </Button>
      {modalVisible && (
        <Picker
          isVisible={modalVisible}
          value={date}
          mode={time ? 'datetime' : 'date'}
          onConfirm={onSave}
          onCancel={onClose}
        />
      )}
    </>
  )
}
