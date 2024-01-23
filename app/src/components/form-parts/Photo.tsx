import React, { useState } from 'react'
import { Alert, Dimensions } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Camera } from 'expo-camera'
import { disabledBackground } from 'utils/formRendering/utils'
import { useStoreState } from 'utils/store'
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
const windowWidth = Dimensions.get('window').width
const isWider = windowWidth > 480
const stackStyle = isWider
  ? [layout.hStack, layout.justifyCenter]
  : [layout.vStack]

const Photo: React.FunctionComponent<PhotoSelectorProps> = ({
  photos,
  addPhoto,
  removePhoto,
  isDisabled,
  onlyOne = false,
}) => {
  const state = useStoreState()
  const i18n = state?.i18n
  const styleS = useStyleSheet(themedStyles)
  const window = useWindowDimensions()
  const modalSize = Math.min(window.height, window.width)
  const [isOpen, setOpen] = useState(false)
  const [camera, setCamera] = useState(null as null | Camera)

  const onAddPhoto = async () => {
    // TODO Should this be? getMediaLibraryPermissionsAsync
    const imagePermission = await ImagePicker.requestCameraPermissionsAsync()
    if (!imagePermission.granted) {
      Alert.alert(
        i18n.t('system.insufficientPermissions'),
        i18n.t('general.todo'),
        [{ text: i18n.t('general.ok') }]
      )
      console.error('TODO could not get permissions', imagePermission)
      return false
    }
    const image = await ImagePicker.launchCameraAsync({
      base64: true,
    })
    if (image.canceled === false) {
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
      Alert.alert(
        i18n.t('system.insufficientPermissions'),
        i18n.t('general.todo'),
        [{ text: i18n.t('general.ok') }]
      )
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
        {i18n.t('buttons.cancel')}
      </Button>
      <Button onPress={onTakePhoto}>{i18n.t('buttons.save')}</Button>
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
              status="info"
              accessoryLeft={DeleteIcon}
              onPress={() => removePhoto(index)}
              aria-label={i18n.t('form.delete-photo')}
            >
              {i18n.t('form.delete-photo')}
            </Button>
          </View>
        )}
        ItemSeparatorComponent={() => <Divider my={2} thickness="1" />}
        ListFooterComponent={() =>
          onlyOne && photos && photos.length > 0 ? (
            <></>
          ) : (
            <View style={stackStyle}>
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
                aria-label={i18n.t('form.add-photo')}
              >
                {i18n.t('form.add-photo')}
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
                aria-label={i18n.t('form.take-photo')}
              >
                {i18n.t('form.take-photo')}
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
            <ModalHeader {...props} text={i18n.t('form.camera-viewer')} />
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
