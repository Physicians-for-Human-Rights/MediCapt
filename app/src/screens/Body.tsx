import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Header, Button } from 'react-native-elements'
import styles_ from 'styles'
import BodyMarker from 'components/BodyMarker'
import Dialog from 'components/Dialog'

export interface Coordinates {
  x: number
  y: number
}

export interface Annotation {
  markerCoordinates: Coordinates
  description: string
  photos: Array<string>
}

export interface Marker {
  annotationIndex?: number
  coordinates: Coordinates
}

function Body({ route, navigation }) {
  const { enterData, baseImage, previousAnnotations } = route.params

  const [annotations, setAnnotations] = useState<Array<Annotation>>(
    previousAnnotations ?? []
  )
  const [selectedMarker, setSelectedMarker] = useState<Marker>(null)

  const selectedAnnotation =
    selectedMarker?.annotationIndex !== undefined
      ? annotations[selectedMarker.annotationIndex]
      : null

  const onSubmit = async () => {
    enterData(baseImage, annotations)
    navigation.goBack()
  }

  const onCancel = () => {
    navigation.goBack()
  }

  // callback for dialog to add finalized annotation with marker
  const confirmAnnotation = (text, photos) => {
    const newAnnotation = {
      markerCoordinates: selectedMarker.coordinates,
      description: text,
      photos,
    }

    if (selectedAnnotation) {
      setAnnotations(prevAnnotations => {
        const newAnnotations = [...prevAnnotations]
        newAnnotations[selectedMarker.annotationIndex] = newAnnotation
        return newAnnotations
      })
    } else {
      setAnnotations(prevAnnotations => [...prevAnnotations, newAnnotation])
    }

    setSelectedMarker(null)
  }

  // callback for dialog to delete previously added annotation
  const deleteAnnotation = () => {
    setAnnotations(prev =>
      prev.filter(annotation => annotation !== selectedAnnotation)
    )
    setSelectedMarker(null)
  }

  return (
    <View style={styles_.container}>
      <Header
        centerComponent={{
          text: 'Mark and annotate diagram',
          style: { color: '#fff' },
        }}
        containerStyle={styles.headerContainer}
      />
      <View style={styles.annotationContainer}>
        <BodyMarker
          baseImage={baseImage}
          annotations={annotations}
          onPress={marker => setSelectedMarker(marker)}
        />
      </View>
      <View style={styles.buttonsContainer}>
        <Button
          title="Submit drawing"
          style={styles.button}
          onPress={onSubmit}
        />
        <Button
          title="Don't submit"
          buttonStyle={{ backgroundColor: '#d5001c' }}
          style={styles.button}
          onPress={onCancel}
        />
      </View>

      <Dialog
        visible={selectedMarker !== null}
        title="Annotation"
        description="Please add any comments on the annotation."
        selectedAnnotation={selectedAnnotation}
        handleCancel={() => setSelectedMarker(null)}
        handleConfirm={confirmAnnotation}
        handleDelete={selectedAnnotation ? deleteAnnotation : undefined}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#d5001c',
    justifyContent: 'space-around',
    width: '100%',
  },
  annotationContainer: {
    flex: 1,
    width: '100%',
  },
  buttonsContainer: {
    flex: 0.2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    width: '100%',
  },
  button: {
    zIndex: 1,
    padding: 12,
    minWidth: 56,
    minHeight: 48,
  },
})

export default Body
