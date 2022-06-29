import { Platform, Alert } from 'react-native'

// NB This exists because react native Alert does not work on browsers

function confirmationDialog(
  title: string,
  message: string,
  fnOk: () => any,
  fnCancel: () => any
) {
  if (Platform.OS === 'web') {
    const ok = window.confirm(title + '\n' + message)
    if (ok) fnOk()
    else fnCancel()
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: fnCancel },
      {
        text: 'Ok',
        style: 'destructive',
        onPress: fnOk,
      },
    ])
  }
}

export default confirmationDialog
