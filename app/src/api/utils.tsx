import React, { useState } from 'react'
import { t } from 'i18n-js'
import _ from 'lodash'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  Feather,
  MaterialIcons,
} from '@expo/vector-icons'
import { handleStandardErrors } from 'utils/errors'

export async function standardHandler<T>(
  {
    setWaiting,
    error,
    warning,
    success,
  }: {
    setWaiting: (s: string | null) => any
    error: any
    warning: any
    success: any
  },
  preMsg: string,
  postMsg: string,
  apiCallFn: () => T
): Promise<T | null> {
  try {
    setWaiting(preMsg)
    const r = await apiCallFn()
    postMsg && success(postMsg)
    return r
  } catch (e) {
    handleStandardErrors(error, warning, success, e)
  } finally {
    setWaiting(null)
  }
  return null
}
