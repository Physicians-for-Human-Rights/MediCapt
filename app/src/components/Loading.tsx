import React from 'react'
import { Text, Spinner } from '@ui-kitten/components'
import { View, StyleSheet, Dimensions } from 'react-native'
import { useStoreState } from '../utils/store'
import { layout } from './styles'
let ScreenHeight = Dimensions.get('window').height
const style = StyleSheet.create({
  spinner: {
    // position: 'absolute',
    // left: 0,
    // right: 0,
    // top: 0,
    // bottom: 0,
    opacity: 0.5,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    zindex: 100,
    width: '100%',
    height: ScreenHeight,
  },
})

const Loading = ({ loading }: { loading: string | null }) => {
  const state = useStoreState()
  const i18n = state?.i18n
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
