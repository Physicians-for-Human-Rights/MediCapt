import React from 'react'
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
import { RecordPath, RecordDataByType } from 'utils/recordTypes'
import { FormFns, ArrayElement } from 'utils/formTypesHelpers'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'
import { t } from 'i18n-js'
import _ from 'lodash'

type PhotoSelectorProps = {
  photos: RecordDataByType['photo']['value']
  addPhoto: (photo: ArrayElement<RecordDataByType['photo']['value']>) => void
  removePhoto: (n: number) => void
}

const Photo: React.FunctionComponent<PhotoSelectorProps> = ({
  photos,
  addPhoto,
  removePhoto,
}) => {
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

  const takePhoto = async () => {
    const permissionsGranted = await verifyPermissions()
    if (!permissionsGranted) {
      console.error('TODO could not get permissions')
      return
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

  return (
    <FlatList
      data={photos}
      renderItem={({ item, index }) => (
        <VStack>
          <Pressable
            py={2}
            w="100%"
            alignItems="center"
            justifyContent="center"
            onPress={() => console.log('TODO add an annotation modal')}
          >
            <Image source={{ uri: item.uri }} size={150} resizeMode="contain" />
          </Pressable>
          <Button
            py={2}
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
        <Button
          my={2}
          fontWeight="bold"
          colorScheme="blue"
          fontSize="md"
          leftIcon={<Icon as={MaterialIcons} name="camera-alt" size="sm" />}
          onPress={takePhoto}
          accessibilityLabel={t('form.add-photo')}
        >
          {t('form.add-photo')}
        </Button>
      )}
    />
  )
}

export default Photo
