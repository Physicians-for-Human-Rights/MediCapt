import React from 'react'
import { useToast } from 'react-native-toast-notifications'
import _ from 'lodash'
import { z } from 'zod'
// toast.show("Task finished successfully", {
//   type: "normal | success | warning | danger | custom",
//   placement: "top | bottom",
//   duration: 4000,
//   offset: 30,
//   animationType: "slide-in | zoom-in",
// });
export const useInfo = () => {
  const toast = useToast()
  return [
    (error: string, description?: string | undefined, otherData?: any) => {
      console.error(error, otherData)
      const str = error + ' ' + description
      toast.show(str, {
        type: 'danger',
        placement: 'bottom',
        duration: 5000,
        // isClosable: true,
        // description,
        // accessibilityAnnouncement: 'Encountered error ' + error,
      })
    },
    (warning: string, description?: string | undefined, otherData?: any) => {
      const str = warning + ' ' + description
      toast.show(str, {
        type: 'warning',
        placement: 'bottom',
        duration: 5000,
        // isClosable: true,
        // description,
      })
    },
    (success: string, description?: string | undefined, otherData?: any) => {
      const str = success + ' ' + description
      toast.show(str, {
        type: 'success',
        placement: 'bottom',
        duration: 5000,
        // isClosable: true,
        // description,
      })
    },
  ] as const
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
