import React, { useState } from 'react'
import Picker from 'react-native-modal-datetime-picker'

import { Button } from '@ui-kitten/components'
import _ from 'lodash'
import { colors } from './nativeBaseSpec'
import { useStoreState, useStoreDispatch } from '../utils/store'

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
  const state = useStoreState()
  const i18n = state?.i18n
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
        style={{
          backgroundColor: _.isDate(date)
            ? colors.success[600]
            : colors.primary[800],
        }}
        aria-label={i18n.t(time ? 'form.enter-date-time' : 'form.enter-date')}
      >
        {date
          ? time
            ? date.toLocaleString()
            : date.toLocaleDateString()
          : i18n.t(time ? 'form.enter-date-time' : 'form.enter-date')}
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
