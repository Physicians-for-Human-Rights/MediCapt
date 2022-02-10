import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  ImageBackground,
  TouchableWithoutFeedback,
  Platform,
  Text,
} from 'react-native'
import styles_ from 'styles'

import { Marker, Annotation } from 'screens/Body'

interface BodyMarkerProps {
  baseImage: any
  confirmMarker: (marker: Marker) => void
  annotations: Array<Annotation>
}

const BodyMarker: React.FunctionComponent<BodyMarkerProps> = props => {
  const [imageSquareSize, setImageSquareSize] = useState(0)

  const handlePress = evt => {
    let x, y
    if (Platform.OS === 'web') {
      x = evt.nativeEvent.offsetX / imageSquareSize
      y = evt.nativeEvent.offsetY / imageSquareSize
    } else {
      x = evt.nativeEvent.locationX / imageSquareSize
      y = evt.nativeEvent.locationY / imageSquareSize
    }

    props.confirmMarker({ coordinates: { x, y } })
  }

  return (
    <View
      style={styles_.container}
      onLayout={event => {
        const { width, height } = event.nativeEvent.layout
        setImageSquareSize(Math.min(width, height))
      }}
    >
      <View style={{ height: imageSquareSize, width: imageSquareSize }}>
        <TouchableWithoutFeedback onPress={handlePress}>
          <ImageBackground
            style={styles.image}
            imageStyle={{ resizeMode: 'contain' }}
            source={{ uri: props.baseImage }}
          >
            {props.annotations.map((annotation, idx) => (
              <TouchableWithoutFeedback
                key={idx}
                onPress={() =>
                  props.confirmMarker({
                    annotationIndex: idx,
                    coordinates: annotation.markerCoordinates,
                  })
                }
              >
                <View
                  style={{
                    ...StyleSheet.flatten(styles.markerContainer),
                    top: annotation.markerCoordinates.y * imageSquareSize - 5,
                    left: annotation.markerCoordinates.x * imageSquareSize - 5,
                  }}
                >
                  <View style={styles.marker} />
                  <Text style={styles.text}>{idx}</Text>
                </View>
              </TouchableWithoutFeedback>
            ))}
          </ImageBackground>
        </TouchableWithoutFeedback>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    height: '100%',
    width: '100%',
  },
  markerContainer: {
    position: 'absolute',
    flexDirection: 'row',
  },
  marker: {
    backgroundColor: 'red',
    height: 10,
    width: 10,
    marginRight: 3,
  },
  text: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 14,
  },
})

export default BodyMarker
