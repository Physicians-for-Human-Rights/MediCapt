import React, { useRef } from 'react'
import { Platform, Alert } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'
import { ParamListBase } from '@react-navigation/native'

function useLeave(
  navigation: StackNavigationProp<ParamListBase>,
  intercept: boolean,
  title: string,
  message: string,
  fnWhenLeave: () => any
) {
  const interceptBack = useRef(intercept)
  interceptBack.current = intercept
  // We protect against the window closing on web
  if (Platform.OS === 'web') {
    const cb = React.useRef((e: any) => {
      if (interceptBack.current) {
        e.preventDefault()
        const exit = window.confirm(title + '\n' + message)
        if (exit) window.close()
      }
    })
    React.useEffect(() => {
      const onUnload = cb.current
      window.addEventListener('beforeunload', onUnload)
      return () => {
        window.removeEventListener('beforeunload', onUnload)
      }
    }, [cb])
  }
  // On all platforms we intercept react navigation
  React.useEffect(
    () =>
      navigation.addListener('beforeRemove', e => {
        if (interceptBack.current) {
          e.preventDefault()
          // react native alerts are silently ignored on the web at this time
          if (Platform.OS === 'web') {
            const exit = window.confirm(title + '\n' + message)
            if (exit) return navigation.dispatch(e.data.action)
          } else {
            Alert.alert(title, message, [
              { text: 'Stay', style: 'cancel', onPress: () => {} },
              {
                text: 'Leave',
                style: 'destructive',
                onPress: () => {
                  fnWhenLeave()
                  return navigation.dispatch(e.data.action)
                },
              },
            ])
          }
        }
      }),
    [navigation]
  )
}

export default useLeave
