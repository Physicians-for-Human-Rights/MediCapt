import React from 'react'
import { Text, Spinner } from '@ui-kitten/components'
import { View, StyleSheet } from 'react-native'
import i18n from 'i18n'
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
          <Spinner aria-label="Loading" size="large" />

          <Text category="h3" style={{ color: 'white' }}>
            {i18n.t('system.loading')}
          </Text>
        </View>
      </View>
    </View>
  ) : (
    <></>
  )
}

export default Loading
