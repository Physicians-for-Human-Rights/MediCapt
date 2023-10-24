import React, { useState, useEffect, useCallback } from 'react'
import _ from 'lodash'
import { FormType } from 'utils/types/form'
// @ts-ignore typescript doesn't do native/web modules
import DisplayPDF from './DisplayPDF'
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
import { layout } from './styles'
import FormPrinted from 'components/FormPrinted'
import FormEditorComponent from 'components/FormEditorComponent'
import { View } from 'react-native'

export default function FormEditorPrinted({
  formMetadata,
  manifest,
  setManifest,
  setForm,
}: {
  formMetadata: Partial<FormMetadata>
  manifest: FormManifestWithData
  setManifest: any
  setForm: (form: FormType) => any
}) {
  return (
    <View style={[layout.alignCenter, layout.hStack]}>
      <FormEditorComponent manifest={manifest} setForm={setForm} />
      <FormPrinted
        formMetadata={formMetadata}
        manifest={manifest}
        setManifest={setManifest}
      />
    </View>
  )
}
