import React from 'react'
import { useToast } from 'native-base'
import _ from 'lodash'
import { z } from 'zod'

export const useInfo = () => {
  const toast = useToast()
  return [
    (error: string, description?: string | undefined, otherData?: any) => {
      console.error(error, otherData)
      toast.show({
        title: error,
        status: 'error',
        placement: 'bottom',
        duration: 5000,
        isClosable: true,
        description,
        accessibilityAnnouncement: 'Encountered error ' + error,
      })
    },
    (warning: string, description?: string | undefined, otherData?: any) => {
      console.trace(warning, otherData)
      toast.show({
        title: warning,
        status: 'warning',
        placement: 'bottom',
        duration: 5000,
        isClosable: true,
        description,
      })
    },
    (success: string, description?: string | undefined, otherData?: any) => {
      console.trace(success, otherData)
      toast.show({
        title: success,
        status: 'success',
        placement: 'bottom',
        duration: 5000,
        isClosable: true,
        description,
      })
    },
  ]
}

export function handleStandardErrors(
  error: any,
  warning: any,
  success: any,
  e: any
) {
  if (e instanceof z.ZodError) {
    console.log(_.join(e.issues[0].path, ' '))
    // TODO i18n and clean up to be more human readable
    error(
      'Invalid contents',
      _.join(e.issues[0].path, ' ') + '\n' + e.issues[0].message,
      e
    )
  } else if (_.isString(e)) {
    error(e)
  } else if (_.isError(e) && e.message === 'Network Error') {
    error('Network error', undefined, e)
  } else {
    // TODO Server errors vs local errors
    error('Server error', undefined, e)
    console.error('Error', e, typeof e)
  }
}
