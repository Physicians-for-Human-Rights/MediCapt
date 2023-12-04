import React from 'react'
import { Text } from '@ui-kitten/components'
import { useStoreState } from '../utils/store'

export default function DisplayPDF() {
  const state = useStoreState()
  const i18n = state?.i18n
  return <Text>{i18n.t('system.pdfViewAvailableWebOnly')}</Text>
}
