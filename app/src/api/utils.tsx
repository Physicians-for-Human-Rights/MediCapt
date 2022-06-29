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

export type StandardReporters = {
  setWaiting: (s: string | null) => any
  error: any
  warning: any
  success: any
}

export async function standardHandler<T>(
  { setWaiting, error, warning, success }: StandardReporters,
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

export function schemaVersions(schema: any) {
  if (
    schema.shape &&
    schema.shape['storage-version'] &&
    schema.shape['storage-version'].value
  )
    return [schema.shape['storage-version'].value]

  if (
    schema._def &&
    schema._def.typeName === 'ZodDiscriminatedUnion' &&
    schema._def.discriminator === 'storage-version'
  ) {
    return Array.from(schema._def.options.keys())
  }
  console.error('BUG cannot determine this schema version', schema)
  throw 'BUG Cannot determine schema version'
}
