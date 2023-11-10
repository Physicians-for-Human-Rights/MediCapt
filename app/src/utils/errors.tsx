import React, { useEffect } from 'react'
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
  console.log({ toast })
  if (Object.keys(toast).length === 0) {
    return null
  }
  console.log('if toast is here', { toast })
  toast.show('Hello World')
  return [
    (error: string, description?: string | undefined, otherData?: any) => {
      console.log('error toast called')
      console.error(error, otherData)
      const str = error + ' ' + description
      console.log('error toast called', str)
      toast.show('err', {
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
  // error: any,
  // warning: any,
  // success: any,
  e: any
) {
  if (e instanceof z.ZodError) {
    console.log(_.join(e.issues[0].path, ' '))
    // TODO i18n and clean up to be more human readable
    // error(
    //   'Invalid contents',
    //   _.join(e.issues[0].path, ' ') + '\n' + e.issues[0].message,
    //   e
    // )
    const desc = _.join(e.issues[0].path, ' ') + '\n' + e.issues[0].message
  } else if (_.isString(e)) {
    // error(e)
  } else if (_.isError(e) && e.message === 'Network Error') {
    // error('Network error', undefined, e)
  } else {
    // TODO Server errors vs local errors
    // error('Server error', undefined, e)
    console.error('Error', e, typeof e)
  }
}

export const formatErrorMsg = (e: any) => {
  if (e instanceof z.ZodError) {
    const desc = _.join(e.issues[0].path, ' ') + '\n' + e.issues[0].message
    return ['Invalid contents', desc]
  } else if (_.isError(e) && e.message === 'Network Error') {
    return ['Network Error', '']
  } else {
    return ['Server Error', '']
  }
}
