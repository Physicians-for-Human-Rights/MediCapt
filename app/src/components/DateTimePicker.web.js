import React, { useState } from 'react'
import { View } from 'react-native'
import _ from 'lodash'
import formatDate from 'utils/date.ts'

import { disabledBackground } from 'utils/formRendering/utils'
import FloatingLabelInput from 'components/FloatingLabelInput'

import 'react-datepicker/dist/react-datepicker.css'
import DatePicker from 'react-datepicker'
import { parseDate } from 'chrono-node'
import {
  Button,
  Modal,
  Card,
  useStyleSheet,
  Input,
} from '@ui-kitten/components'
import { layout } from './styles'
import ModalHeader from './styledComponents/ModalHeader'
import themedStyles from '../themeStyled'
import { useStoreState } from '../utils/store'
import { CalenderIcon } from './Icons'

export default function DateTimePicker({
  title,
  date,
  open,
  close,
  setDate,
  time = null,
  isDisabled,
  fancyLabel = undefined,
}) {
  const state = useStoreState()
  const i18n = state?.i18n
  const styleS = useStyleSheet(themedStyles)
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
      <View
        style={[
          layout.center,
          { backgroundColor: isDisabled ? disabledBackground : undefined },
        ]}
      >
        <View style={layout.hStack}>
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
              disabled={isDisabled}
              style={[styleS.mx3, styleS.width75Percent, styleS.maxWidth200]}
              size="mdium"
              placeholder={i18n.t(
                time ? 'form.enter-date-time' : 'form.enter-date'
              )}
              onChangeText={setDateString}
              value={dateString}
              onSubmitEditing={onSaveText}
              onEndEditing={onSaveText}
              aria-label={i18n.t(
                time ? 'form.enter-date-time' : 'form.enter-date'
              )}
            />
          )}
          <View style={layout.center}>
            <Button
              disabled={isDisabled}
              onPress={openInternal}
              size="medium"
              // mt={fancyLabel ? 2 : 0}
              // status="indigo"
              appearance="filled"
              accessoryLeft={<CalenderIcon />}
              aria-label={i18n.t('buttons.openCalendar')}
              style={{
                backgroundColor: '#4f46e5',
                border: 0,
                marginBottom: -10,
                paddingHorizontal: 0,
                paddingVertical: 0,
              }}
            />
          </View>
        </View>
      </View>
      <Modal
        visible={modalVisible}
        onBackdropPress={onClose}
        style={{ maxWidth: 400 }}
        backdropStyle={styleS.backdrop}
      >
        <Card header={props => <ModalHeader {...props} text={title} />}>
          <View style={layout.center}>
            <DatePicker
              selected={date}
              onChange={onSave}
              inline
              fixedHeight
              showYearDropdown={fancyLabel ? true : false}
            />
          </View>
        </Card>
      </Modal>
    </>
  )
}
