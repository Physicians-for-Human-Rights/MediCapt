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
  annotations: Array<Annotation>
  onPress?: (marker: Marker) => void
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

    props.onPress({ coordinates: { x, y } })
  }

  const markerSize = props.onPress ? 10 : 5

  return (
    <View
      style={styles_.container}
      onLayout={event => {
        const { width, height } = event.nativeEvent.layout
        setImageSquareSize(Math.min(width, height))
      }}
    >
      <View style={{ height: imageSquareSize, width: imageSquareSize }}>
        <TouchableWithoutFeedback onPress={props.onPress && handlePress}>
          <ImageBackground
            style={styles.image}
            imageStyle={{ resizeMode: 'contain' }}
            source={{ uri: props.baseImage }}
          >
            {props.annotations.map((annotation, idx) => (
              <TouchableWithoutFeedback
                key={idx}
                onPress={
                  props.onPress &&
                  (() =>
                    props.onPress({
                      annotationIndex: idx,
                      coordinates: annotation.markerCoordinates,
                    }))
                }
              >
                <View
                  style={{
                    ...StyleSheet.flatten(styles.markerContainer),
                    top:
                      annotation.markerCoordinates.y * imageSquareSize -
                      markerSize / 2,
                    left:
                      annotation.markerCoordinates.x * imageSquareSize -
                      markerSize / 2,
                  }}
                >
                  <View
                    style={{
                      ...StyleSheet.flatten(styles.marker),
                      height: markerSize,
                      width: markerSize,
                    }}
                  />
                  <Text
                    style={{
                      ...StyleSheet.flatten(styles.text),
                      fontSize: props.onPress ? 14 : 9,
                      marginRight: props.onPress ? 3 : 1,
                    }}
                  >
                    {idx + 1}
                  </Text>
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
  },
  text: {
    color: 'red',
    fontWeight: 'bold',
  },
})

export default BodyMarker
