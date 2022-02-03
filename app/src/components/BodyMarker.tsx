import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  ImageBackground,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native'
import styles_ from 'styles'

const BodyMarker = props => {
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

    props.confirmMarker({ x, y })
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
              <View
                key={idx}
                style={{
                  ...StyleSheet.flatten(styles.markers),
                  top: annotation.markerCoordinates.y * imageSquareSize,
                  left: annotation.markerCoordinates.x * imageSquareSize,
                }}
              />
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
  markers: {
    position: 'absolute',
    backgroundColor: 'black',
    height: 10,
    width: 10,
  },
})

export default BodyMarker
