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

export async function standardHandler(
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
  apiCallFn: () => any
) {
  try {
    setWaiting('Updating location')
    await apiCallFn()
    success('Location updated')
  } catch (e) {
    handleStandardErrors(error, warning, success, e)
  } finally {
    setWaiting(null)
  }
}
