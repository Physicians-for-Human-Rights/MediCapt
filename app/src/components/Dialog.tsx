import React, { useState } from 'react'
import { Button, Overlay } from 'react-native-elements'
import { View, Text, StyleSheet, TextInput } from 'react-native'

type DialogProps = {
  visible: boolean
  title: string
  description: string
  handleCancel: () => void
  handleConfirm: (text: string) => void
}

const Dialog: React.FunctionComponent<DialogProps> = props => {
  const [text, setText] = useState('')

  const handleConfirm = () => {
    props.handleConfirm(text)
    setText('')
  }

  const handleCancel = () => {
    props.handleCancel()
    setText('')
  }

  return (
    <View>
      <Overlay isVisible={props.visible} onBackdropPress={handleCancel}>
        <Text style={styles.textPrimary}>{props.title}</Text>
        <Text style={styles.textSecondary}>{props.description}</Text>
        <TextInput
          value={text}
          onChangeText={value => setText(value)}
          style={styles.textInput}
          multiline={true}
          blurOnSubmit={true}
          textAlignVertical="top"
        />
        <View style={styles.buttonsContainer}>
          <Button
            title="Cancel"
            onPress={handleCancel}
            containerStyle={styles.button}
          />
          <Button
            title="Confirm"
            onPress={handleConfirm}
            containerStyle={styles.button}
          />
        </View>
      </Overlay>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  button: {
    zIndex: 1,
    minWidth: 56,
    minHeight: 48,
    margin: 10,
  },
  textPrimary: {
    marginVertical: 20,
    textAlign: 'center',
    fontSize: 20,
  },
  textSecondary: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 17,
  },
  textInput: {
    height: 100,
    borderColor: 'black',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
})

export default Dialog
