import React, { useState, useRef, useEffect } from 'react'
import { Box, VStack, Image, Text, Button, Modal, View } from 'native-base'
import {
  StyleSheet,
  ImageBackground,
  TouchableWithoutFeedback,
  Platform,
  GestureResponderEvent,
} from 'react-native'
import Photo from 'components/form-parts/Photo'
import { t } from 'i18n-js'
import _ from 'lodash'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'

function squareToImageCoordinates(
  p: {
    x: number
    y: number
  },
  imageDimensions: {
    w: number
    h: number
  } | null
): null | { x: number; y: number } {
  if (imageDimensions) {
    const ratiohw = imageDimensions.h / imageDimensions.w
    const ratiowh = imageDimensions.w / imageDimensions.h
    if (ratiohw > 1) {
      const x = (p.x - 0.5) / ratiowh + 0.5
      if (x < 0 || x >= 1) return null
      return { x, y: p.y }
    } else {
      const y = (p.y - 0.5) / ratiowh + 0.5
      if (y < 0 || y >= 1) return null
      return { x: p.x, y }
    }
  }
  return null
}

function imageToSquareCoordinates(
  p: {
    x: number
    y: number
  },
  imageDimensions: {
    w: number
    h: number
  }
): { x: number; y: number } {
  const ratiohw = imageDimensions.h / imageDimensions.w
  const ratiowh = imageDimensions.w / imageDimensions.h
  if (ratiohw > 1) {
    const x = (p.x - 0.5) * ratiowh + 0.5
    return { x, y: p.y }
  } else {
    const y = (p.y - 0.5) * ratiowh + 0.5
    return { x: p.x, y }
  }
}

export type BodyMarkerAnnotation = {
  location: {
    x: number
    y: number
  }
  text: string
  photos: Photo[]
}

function BodyMarker({
  baseImage,
  annotations,
  onAnnotate,
  onDeleteAnnotation,
  onCoverPress,
  isDisabled,
}: {
  baseImage: string
  annotations: BodyMarkerAnnotation[]
  onAnnotate?: (annotation: BodyMarkerAnnotation, index: number | null) => any
  onDeleteAnnotation?: (index: number) => any
  onCoverPress?: () => any
  isDisabled: boolean
}) {
  const [imageSquareSize, setImageSquareSize] = useState(0)
  const [imageDimensions, setImageDimensions] = useState(
    null as null | { w: number; h: number }
  )
  const ref = useRef()

  const [currentMarkerIndex, setCurrentMarkerIndex] = useState(
    null as null | number
  )
  const [currentLocation, setCurrentLocation] = useState(
    null as null | { x: number; y: number }
  )
  const [currentAnnotation, setCurrentAnnotation] = useState('')
  const [currentPhotos, setCurrentPhotos] = useState([] as Photo[])
  const [isMarkerModalOpen, setMarkerModalOpen] = useState(false)

  useEffect(() => {
    Image.getSize(
      baseImage,
      // @ts-ignore TODO What's up here?
      (x: number, y: number) => setImageDimensions({ w: x, h: y }),
      console.error // TODO handle this error
    )
  }, [])

  const onPress = (
    location: { x: number; y: number },
    text?: string,
    photos?: Photo[],
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
        // @ts-ignore This property does exist
        x = evt.nativeEvent.offsetX / imageSquareSize
        // @ts-ignore This property does exist
        y = evt.nativeEvent.offsetY / imageSquareSize
      } else {
        x = evt.nativeEvent.locationX / imageSquareSize
        y = evt.nativeEvent.locationY / imageSquareSize
      }
      // Prevent clicking outside of the image
      const imageCoordintes = squareToImageCoordinates(
        { x, y },
        imageDimensions
      )
      if (imageCoordintes) {
        onPress(imageCoordintes)
      }
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
          disabled={isDisabled}
        >
          <ImageBackground
            style={styles.image}
            imageStyle={{ resizeMode: 'contain' }}
            source={{ uri: baseImage }}
          >
            {annotations.map((annotation, idx) => {
              if (!imageDimensions) {
                return null
              }
              const squareLocation = imageToSquareCoordinates(
                annotation.location,
                imageDimensions
              )
              return (
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
                      squareLocation.y * imageSquareSize - markerSize / 2 + 'px'
                    }
                    left={
                      squareLocation.x * imageSquareSize - markerSize / 2 + 'px'
                    }
                  >
                    <Box
                      bg="#f00"
                      w={markerSize + 'px'}
                      h={markerSize + 'px'}
                    />
                    <Text bold color="red" selectable={false}>
                      {idx + 1}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              )
            })}
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
                isDisabled={isDisabled}
                photos={currentPhotos || []}
                addPhoto={(toAdd: Photo) => {
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
