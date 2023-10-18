import React, { useState } from 'react'
import { Alert } from 'react-native'
import {
  VStack,
  HStack,
  Pressable,
  Icon,
  Image,
  Divider,
  Button,
  Center,
  Modal,
  FlatList,
} from 'native-base'
import * as ImagePicker from 'expo-image-picker'
import { Camera } from 'expo-camera'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { disabledBackground } from 'utils/formRendering/utils'
import { t } from 'i18n-js'
import _ from 'lodash'
import { useWindowDimensions, View } from 'react-native'

type PhotoSelectorProps = {
  photos: Photo[]
  addPhoto: (photo: Photo) => any
  removePhoto: (n: number) => any
  isDisabled: boolean
  onlyOne?: boolean
}
type Photo = {
  uri: string
  'date-taken'?: Date
}

const disabledStyle = { backgroundColor: disabledBackground }
const goodStyle = {}

const Photo: React.FunctionComponent<PhotoSelectorProps> = ({
  photos,
  addPhoto,
  removePhoto,
  isDisabled,
  onlyOne = false,
}) => {
  const window = useWindowDimensions()
  const modalSize = Math.min(window.height, window.width)
  const [isOpen, setOpen] = useState(false)
  const [camera, setCamera] = useState(null as null | Camera)

  const onAddPhoto = async () => {
    // TODO Should this be? getMediaLibraryPermissionsAsync
    const imagePermission = await ImagePicker.requestCameraPermissionsAsync()
    if (!imagePermission.granted) {
      Alert.alert('Insufficient Permissions', 'TODO', [{ text: 'Okay' }])
      console.error('TODO could not get permissions', imagePermission)
      return false
    }
    const image = await ImagePicker.launchCameraAsync({
      base64: true,
    })
    if (image.cancelled === false) {
      addPhoto({
        uri: `data:image/jpeg;base64,${image.base64}`,
        'date-taken': new Date(),
      })
    } else {
      console.error('TODO do something here')
    }
  }

  const onTakePhotoOpenModal = async () => {
    const cameraPermissions = await Camera.requestCameraPermissionsAsync()
    if (!cameraPermissions.granted) {
      Alert.alert('Insufficient Permissions', 'TODO', [{ text: 'Okay' }])
      console.error('TODO could not get permissions', cameraPermissions)
      return
    }
    internalOpen()
  }

  const onTakePhoto = async () => {
    if (camera) {
      const image = await camera.takePictureAsync({
        quality: 0.7,
        base64: true,
        exif: true,
      })
      if (image.base64) {
        // NB takePictureAsync already inserts the mime header
        addPhoto({
          uri: image.base64,
          'date-taken': new Date(),
        })
      } else {
        console.error('TODO do something here, photo was empty')
      }
    } else {
      console.error('TODO do something here, failed to take photo')
    }
    internalClose()
  }

  const internalClose = () => {
    setOpen(false)
  }
  const internalOpen = () => {
    setOpen(true)
  }

  const onCancel = () => {
    internalClose()
  }

  return (
    <>
      <FlatList
        data={photos}
        style={isDisabled ? disabledStyle : goodStyle}
        renderItem={({ item, index }) => (
          <VStack>
            <Pressable
              py={2}
              w="100%"
              isDisabled={isDisabled}
              alignItems="center"
              justifyContent="center"
              onPress={() => console.error('TODO add an annotation modal')}
            >
              <Image
                source={{ uri: item.uri }}
                size={150}
                resizeMode="contain"
              />
            </Pressable>
            <Button
              py={2}
              isDisabled={isDisabled}
              fontWeight="bold"
              colorScheme="blue"
              fontSize="md"
              leftIcon={<Icon as={MaterialIcons} name="delete" size="sm" />}
              onPress={() => removePhoto(index)}
              accessibilityLabel={t('form.delete-photo')}
            >
              {t('form.delete-photo')}
            </Button>
          </VStack>
        )}
        ItemSeparatorComponent={() => <Divider my={2} thickness="1" />}
        ListFooterComponent={() =>
          onlyOne && photos && photos.length > 0 ? (
            <></>
          ) : (
            <HStack justifyContent="center">
              <Button
                my={2}
                mx={2}
                fontWeight="bold"
                colorScheme="blue"
                isDisabled={isDisabled}
                fontSize="md"
                leftIcon={<Icon as={Feather} name="upload-cloud" size="sm" />}
                onPress={onAddPhoto}
                accessibilityLabel={t('form.add-photo')}
              >
                {t('form.add-photo')}
              </Button>
              <Button
                my={2}
                mx={2}
                fontWeight="bold"
                colorScheme="blue"
                isDisabled={isDisabled}
                fontSize="md"
                leftIcon={
                  <Icon as={MaterialIcons} name="camera-alt" size="sm" />
                }
                onPress={onTakePhotoOpenModal}
                accessibilityLabel={t('form.take-photo')}
              >
                {t('form.take-photo')}
              </Button>
            </HStack>
          )
        }
      />
      <Modal isOpen={isOpen} onClose={internalClose} size="full">
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>{t('form.camera-viewer')}</Modal.Header>
          <Modal.Body>
            <Center flex={1}>
              <View style={{ height: modalSize * 0.7, width: modalSize * 0.7 }}>
                {isOpen && (
                  <Camera
                    ref={setCamera}
                    type={Camera.Constants.Type.back}
                    ratio={'1:1'}
                  />
                )}
              </View>
            </Center>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onCancel}>
                {t('form.cancel-photo')}
              </Button>
              <Button onPress={onTakePhoto}>{t('form.save-photo')}</Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default Photo
