import React, { useState } from 'react'
import { Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Camera } from 'expo-camera'
import { disabledBackground } from 'utils/formRendering/utils'
import { t } from 'i18n-js'
import _ from 'lodash'
import {
  Pressable,
  Image,
  FlatList,
  useWindowDimensions,
  View,
} from 'react-native'
import {
  Button,
  useStyleSheet,
  Modal,
  Card,
  Divider,
} from '@ui-kitten/components'
import themedStyles from '../../themeStyled'
import { CameraIcon, DeleteIcon, UploadCloudIcon } from 'components/Icons'
import { layout, spacing } from '../styles'
import ModalHeader from 'components/styledComponents/ModalHeader'

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
  const styleS = useStyleSheet(themedStyles)
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
  const Footer = (
    <>
      <Button
        style={[styleS.mr2]}
        appearance="ghost"
        status="blueGray"
        onPress={onCancel}
      >
        {t('form.cancel-photo')}
      </Button>
      <Button onPress={onTakePhoto}>{t('form.save-photo')}</Button>
    </>
  )
  return (
    <>
      <FlatList
        data={photos}
        style={isDisabled ? disabledStyle : goodStyle}
        renderItem={({ item, index }) => (
          <View style={[layout.vStack]}>
            <Pressable
              style={[
                spacing.py2,
                layout.width100percent,
                layout.alignCenter,
                layout.justifyCenter,
              ]}
              disabled={isDisabled}
              onPress={() => console.error('TODO add an annotation modal')}
            >
              <Image
                style={{ width: 150 }}
                source={{ uri: item.uri }}
                resizeMode="contain"
              />
            </Pressable>
            <Button
              style={[styleS.fontBold, styleS.fontSizeMd, styleS.py2]}
              disabled={isDisabled}
              appearance="info"
              accessoryLeft={DeleteIcon}
              onPress={() => removePhoto(index)}
              accessibilityLabel={t('form.delete-photo')}
            >
              {t('form.delete-photo')}
            </Button>
          </View>
        )}
        ItemSeparatorComponent={() => <Divider my={2} thickness="1" />}
        ListFooterComponent={() =>
          onlyOne && photos && photos.length > 0 ? (
            <></>
          ) : (
            <View style={[layout.hStack, layout.justifyCenter]}>
              <Button
                style={[
                  styleS.my2,
                  styleS.mx2,
                  styleS.fontBold,
                  styleS.fontSizeMd,
                ]}
                status="info"
                disabled={isDisabled}
                accessoryLeft={UploadCloudIcon}
                onPress={onAddPhoto}
                accessibilityLabel={t('form.add-photo')}
              >
                {t('form.add-photo')}
              </Button>
              <Button
                style={[
                  styleS.my2,
                  styleS.mx2,
                  styleS.fontBold,
                  styleS.fontSizeMd,
                ]}
                status="info"
                disabled={isDisabled}
                accessoryLeft={CameraIcon}
                onPress={onTakePhotoOpenModal}
                accessibilityLabel={t('form.take-photo')}
              >
                {t('form.take-photo')}
              </Button>
            </View>
          )
        }
      />
      <Modal
        visible={isOpen}
        onBackdropPress={internalClose}
        backdropStyle={styleS.backdrop}
      >
        <Card
          header={props => (
            <ModalHeader {...props} text={t('form.camera-viewer')} />
          )}
          footer={Footer}
        >
          <View style={[layout.center, layout.flex1]}>
            <View style={{ height: modalSize * 0.7, width: modalSize * 0.7 }}>
              {isOpen && (
                <Camera
                  ref={setCamera}
                  type={Camera.Constants.Type.back}
                  ratio={'1:1'}
                />
              )}
            </View>
          </View>
        </Card>
      </Modal>
    </>
  )
}

export default Photo
