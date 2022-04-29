import React from 'react'
import { Heading, Center, HStack, Text, View, Spinner } from 'native-base'
import { t } from 'i18n-js'

const spinnerStyle = {
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
}

const Loading = ({ loading }: { loading: string | null }) => {
  return loading ? (
    <View style={spinnerStyle}>
      <Center>
        <HStack space={5} justifyContent="center">
          <Spinner size="lg" />
          <Heading size="lg" color="white">
            Loading...
          </Heading>
        </HStack>
      </Center>
    </View>
  ) : (
    <></>
  )
}

export default Loading
