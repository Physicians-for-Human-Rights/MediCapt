import React, { useState, useRef } from 'react'
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
  View,
} from 'native-base'
import {
  StyleSheet,
  ImageBackground,
  TouchableWithoutFeedback,
  Platform,
  GestureResponderEvent,
} from 'react-native'
import { RecordPath, RecordDataByType } from 'utils/recordTypes'
import { t } from 'i18n-js'
import _ from 'lodash'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import { ArrayElement } from 'utils/formTypesHelpers'
import Photo from 'components/form-parts/Photo'

function BodyMarker({
  baseImage,
  annotations,
  onAnnotate,
  onDeleteAnnotation,
  onCoverPress,
}: {
  baseImage: RecordDataByType['body-image']['uri']
  annotations: RecordDataByType['body-image']['annotations']
  onAnnotate?: (
    annotation: ArrayElement<RecordDataByType['body-image']['annotations']>,
    index: number | null
  ) => any
  onDeleteAnnotation?: (index: number) => any
  onCoverPress?: () => any
}) {
  const [imageSquareSize, setImageSquareSize] = useState(0)
  const ref = useRef()

  const [currentMarkerIndex, setCurrentMarkerIndex] = useState(
    null as null | number
  )
  const [currentLocation, setCurrentLocation] = useState(
    null as null | { x: number; y: number }
  )
  const [currentAnnotation, setCurrentAnnotation] = useState('')
  const [currentPhotos, setCurrentPhotos] = useState(
    [] as ArrayElement<RecordDataByType['body-image']['annotations']>['photos']
  )
  const [isMarkerModalOpen, setMarkerModalOpen] = useState(false)

  const onPress = (
    location: { x: number; y: number },
    text?: string,
    photos?: ArrayElement<
      RecordDataByType['body-image']['annotations']
    >['photos'],
    index?: number
  ) => {
    if (index === undefined) {
      setCurrentMarkerIndex(null)
    } else {
      setCurrentMarkerIndex(index)
    }
    setCurrentLocation(location)
    setCurrentAnnotation(text || '')
    setCurrentPhotos(photos || [])
    setMarkerModalOpen(!isMarkerModalOpen)
  }

  const onSaveMarker = async () => {
    currentLocation &&
      onAnnotate &&
      onAnnotate(
        {
          location: currentLocation,
          text: currentAnnotation,
          photos: currentPhotos,
        },
        currentMarkerIndex
      )
    setCurrentMarkerIndex(null)
    setCurrentAnnotation('')
    setCurrentPhotos([])
    setCurrentLocation(null)
    setMarkerModalOpen(false)
  }

  const onCancelMarker = () => {
    setCurrentMarkerIndex(null)
    setCurrentAnnotation('')
    setCurrentPhotos([])
    setCurrentLocation(null)
    setMarkerModalOpen(false)
  }

  const onDeleteMarker = () => {
    if (currentMarkerIndex && onDeleteAnnotation) {
      onDeleteAnnotation(currentMarkerIndex)
    }
    onCancelMarker()
  }

  const handlePress = (evt: GestureResponderEvent) => {
    if (onCoverPress) {
      return onCoverPress()
    }
    if (onAnnotate) {
      let x, y
      if (Platform.OS === 'web') {
        x = evt.nativeEvent.offsetX / imageSquareSize
        y = evt.nativeEvent.offsetY / imageSquareSize
      } else {
        x = evt.nativeEvent.locationX / imageSquareSize
        y = evt.nativeEvent.locationY / imageSquareSize
      }
      onPress({ x, y })
    }
  }

  const markerSize = 10

  return (
    <>
      <View
        ref={ref}
        flex={1}
        onLayout={event => {
          const { width, height } = event.nativeEvent.layout
          setImageSquareSize(Math.min(width, height))
        }}
      >
        <TouchableWithoutFeedback
          onPress={(onAnnotate || onCoverPress) && handlePress}
          accessibilityRole="image"
          style={{ zIndex: -1 }}
        >
          <ImageBackground
            style={styles.image}
            imageStyle={{ resizeMode: 'contain' }}
            source={{ uri: baseImage }}
          >
            {annotations.map((annotation, idx) => (
              <TouchableWithoutFeedback
                disabled={!onAnnotate}
                key={idx}
                onPress={
                  onAnnotate &&
                  (() =>
                    onPress(
                      annotation.location,
                      annotation.text,
                      annotation.photos,
                      idx
                    ))
                }
              >
                <View
                  position="absolute"
                  flexDirection="row"
                  top={
                    annotation.location.y * imageSquareSize -
                    markerSize / 2 +
                    'px'
                  }
                  left={
                    annotation.location.x * imageSquareSize -
                    markerSize / 2 +
                    'px'
                  }
                >
                  <Box bg="#f00" w={markerSize + 'px'} h={markerSize + 'px'} />
                  <Text bold color="red" selectable={false}>
                    {idx + 1}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            ))}
          </ImageBackground>
        </TouchableWithoutFeedback>
      </View>
      <Modal
        isOpen={isMarkerModalOpen}
        onClose={() => setMarkerModalOpen(!isMarkerModalOpen)}
        size="lg"
      >
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>{t('form.mark-diagram')}</Modal.Header>
          <Modal.Body>
            <VStack>
              <DebouncedTextInput
                value={currentAnnotation}
                onChangeText={setCurrentAnnotation}
                debounceMs={500}
                placeholder={'Describe the marker'}
                multiline={true}
                numberOfLines={5}
                size="md"
                bg="coolGray.100"
                variant="filled"
                w="100%"
              />
              <Photo
                photos={currentPhotos || []}
                addPhoto={(
                  toAdd: ArrayElement<RecordDataByType['photo']['value']>
                ) => {
                  setCurrentPhotos(currentPhotos.concat(toAdd))
                }}
                removePhoto={(n: number) => {
                  const r = _.cloneDeep(currentPhotos)
                  _.pullAt(r, [n])
                  setCurrentPhotos(r)
                }}
              />
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="red"
                onPress={onDeleteMarker}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={onCancelMarker}
              >
                Cancel
              </Button>
              <Button colorScheme="blue" onPress={onSaveMarker}>
                Save
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  image: {
    maxHeight: '100%',
    maxWidth: '100%',
    flex: 1,
  },
  markerContainer: {
    position: 'absolute',
    flexDirection: 'row',
  },
})

export default BodyMarker
