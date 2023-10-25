import React, { useState } from 'react'
import { View } from 'react-native'
import _ from 'lodash'
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
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
import themedStyles from 'themeStyled'

const styleS = useStyleSheet(themedStyles)

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
              placeholder={t(time ? 'form.enter-date-time' : 'form.enter-date')}
              onChangeText={setDateString}
              value={dateString}
              onSubmitEditing={onSaveText}
              onEndEditing={onSaveText}
              accessibilityLabel={t(
                time ? 'form.enter-date-time' : 'form.enter-date'
              )}
            />
          )}
          <View style={layout.center}>
            <Button
              disabled={isDisabled}
              onPress={openInternal}
              size="small"
              mt={fancyLabel ? 2 : 0}
              status="indigo"
              appearance="filled"
              accessoryLeft={CalenderIcon}
              accessibilityLabel={'Open calendar'}
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
