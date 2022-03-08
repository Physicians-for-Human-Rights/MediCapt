import React, { useState } from 'react'
import { Alert } from 'react-native'
import {
  Box,
  VStack,
  StatusBar,
  ScrollView,
  HStack,
  Pressable,
  Icon,
  Image,
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
  Checkbox,
  Select,
  FlatList,
} from 'native-base'
import * as ImagePicker from 'expo-image-picker'
import { Camera } from 'expo-camera'
import { RecordPath, RecordDataByType } from 'utils/recordTypes'
import { FormFns, ArrayElement } from 'utils/formTypesHelpers'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  Feather,
  MaterialIcons,
} from '@expo/vector-icons'
import { disabledBackground } from 'utils/formRendering/utils'
import { t } from 'i18n-js'
import _ from 'lodash'
import { useWindowDimensions } from 'react-native'

type PhotoSelectorProps = {
  photos: RecordDataByType['photo']['value']
  addPhoto: (photo: ArrayElement<RecordDataByType['photo']['value']>) => void
  removePhoto: (n: number) => void
  isDisabled: boolean
}

const disabledStyle = { backgroundColor: disabledBackground }
const goodStyle = {}

const Photo: React.FunctionComponent<PhotoSelectorProps> = ({
  photos,
  addPhoto,
  removePhoto,
  isDisabled,
}) => {
  const window = useWindowDimensions()
  const modalSize = Math.min(window.height, window.width)
  const [isOpen, setOpen] = useState(false)
  const [camera, setCamera] = useState(null as null | Camera)

  const verifyPermissions = async () => {
    const cameraPermissions = await ImagePicker.requestCameraPermissionsAsync()
    return true
  }

  const onAddPhoto = async () => {
    // TODO Should this be? getMediaLibraryPermissionsAsync
    const imagePermission = await ImagePicker.requestCameraPermissionsAsync()
    if (!imagePermission.granted) {
      Alert.alert('Insufficient Permissions', 'TODO', [{ text: 'Okay' }])
      console.error('TODO could not get permissions', imagePermissions)
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
        ListFooterComponent={() => (
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
              leftIcon={<Icon as={MaterialIcons} name="camera-alt" size="sm" />}
              onPress={onTakePhotoOpenModal}
              accessibilityLabel={t('form.take-photo')}
            >
              {t('form.take-photo')}
            </Button>
          </HStack>
        )}
      />
      <Modal isOpen={isOpen} onClose={internalClose} size="full">
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>{t('form.camera-viewer')}</Modal.Header>
          <Modal.Body>
            <Center flex={1}>
              <Box h={modalSize * 0.7} w={modalSize * 0.7}>
                <Camera
                  ref={setCamera}
                  type={Camera.Constants.Type.back}
                  ratio={'1:1'}
                />
              </Box>
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
