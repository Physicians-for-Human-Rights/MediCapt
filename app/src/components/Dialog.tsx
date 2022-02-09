import React, { useState } from 'react'
import { Button, Overlay } from 'react-native-elements'
import { View, Text, StyleSheet, TextInput } from 'react-native'

type DialogProps = {
  visible: boolean
  title: string
  description: string
  inputText: string
  handleCancel: () => void
  handleConfirm: (text: string) => void
  handleDelete?: () => void
}

const Dialog: React.FunctionComponent<DialogProps> = props => {
  const [text, setText] = useState(props.inputText ?? '')

  React.useEffect(() => {
    setText(props.inputText ?? '')
  }, [props.visible])

  return (
    <View>
      <Overlay isVisible={props.visible} onBackdropPress={props.handleCancel}>
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
          {props.handleDelete && (
            <Button
              title="Delete"
              buttonStyle={{ backgroundColor: '#d5001c' }}
              onPress={props.handleDelete}
              containerStyle={styles.button}
            />
          )}
          <View style={styles.rightButtons}>
            <Button
              title="Cancel"
              onPress={props.handleCancel}
              containerStyle={styles.button}
            />
            <Button
              title="Confirm"
              onPress={() => props.handleConfirm(text)}
              containerStyle={styles.button}
            />
          </View>
        </View>
      </Overlay>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  rightButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
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
