import React from 'react'
import { HStack, Text, View, Spinner } from 'native-base'
import { t } from 'i18n-js'

const spinnerStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  opacity: 0.3,
  backgroundColor: 'black',
  alignItems: 'center',
  justifyContent: 'center',
  zindex: 100,
}

const Loading = ({ loading }: { loading: string | null }) => {
  return loading ? (
    // @ts-ignore TODO why doesn't it 'center'?
    <View style={spinnerStyle}>
      <HStack space={5}>
        <Spinner size={'lg'} />
        <Text color="black">Loading...</Text>
      </HStack>
    </View>
  ) : (
    <></>
  )
}

export default Loading
