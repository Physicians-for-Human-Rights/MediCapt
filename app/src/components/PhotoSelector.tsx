import React from 'react'
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Image,
  Platform,
  Alert,
} from 'react-native'
import { Button, Icon } from 'react-native-elements'
import * as ImagePicker from 'expo-image-picker'

type PhotoSelectorProps = {
  photos: Array<string>
  setPhotos: React.Dispatch<React.SetStateAction<Array<string>>>
}

const PhotoSelector: React.FunctionComponent<PhotoSelectorProps> = props => {
  const { photos, setPhotos } = props

  const verifyPermissions = async () => {
    const cameraPermissions = await ImagePicker.requestCameraPermissionsAsync()
    if (!cameraPermissions.granted) {
      Alert.alert(
        'Insufficient Permissions',
        'Turn on Camera access in MediCapt from Settings to add photos to the report.',
        [{ text: 'Okay' }]
      )
      return false
    }
    return true
  }

  const takePhotoHandler = async () => {
    const permissionsGranted = await verifyPermissions()
    if (!permissionsGranted) {
      return
    }
    const image = await ImagePicker.launchCameraAsync({
      base64: true,
    })
    if (image.cancelled == false) {
      setPhotos(prev => [...prev, `data:image/jpeg;base64,${image.base64}`])
    }
  }

  return (
    <View>
      <View style={styles.photosContainer}>
        {photos.map((photo, idx) => (
          <TouchableWithoutFeedback
            key={idx}
            onPress={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
          >
            <Image
              source={{ uri: photo }}
              resizeMode="cover"
              style={styles.photo}
            />
          </TouchableWithoutFeedback>
        ))}
      </View>
      <Button
        icon={<Icon name="photo-camera" size={15} color="white" />}
        title={Platform.OS == 'web' ? 'Select Photo' : 'Take Photo'}
        style={styles.button}
        containerStyle={styles.buttonContainer}
        onPress={takePhotoHandler}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  photo: {
    width: 50,
    height: 50,
    margin: 10,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    zIndex: 1,
    padding: 12,
    minHeight: 48,
    width: '100%',
  },
})

export default PhotoSelector
