import React from 'react'
import { Text } from '@ui-kitten/components'
import i18n from 'i18n'

export default function DisplayPDF() {
  return <Text>{i18n.t('system.pdfViewAvailableWebOnly')}</Text>
}
