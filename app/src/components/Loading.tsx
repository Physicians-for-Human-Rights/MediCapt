import React from 'react'
import { Spinner } from 'native-base'
import { Text } from '@ui-kitten/components'
import { View, StyleSheet } from 'react-native'
import { t } from 'i18n-js'
import { layout } from './styles'

const style = StyleSheet.create({
  spinner: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    zindex: 100,
  },
})

const Loading = ({ loading }: { loading: string | null }) => {
  return loading ? (
    <View style={style.spinner}>
      <View style={layout.center}>
        <View style={[layout.hStackGap5, layout.justifyCenter]}>
          <Spinner size="lg" />
          <Text category="h3" style={{ color: 'white' }}>
            Loading...
          </Text>
        </View>
      </View>
    </View>
  ) : (
    <></>
  )
}

export default Loading
