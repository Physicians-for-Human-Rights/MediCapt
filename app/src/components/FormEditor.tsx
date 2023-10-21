import React from 'react'
import { Text } from '@ui-kitten/components'
import { FormType } from 'utils/types/form'
import { useWindowDimensions, View } from 'react-native'
import { Platform } from 'react-native'
import Form from 'components/Form'
// @ts-ignore typescript doesn't support .web.js and .native.js files
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
import FormEditorComponent from 'components/FormEditorComponent'
import { layout, spacing } from './styles'

const FormMemo = React.memo(Form)

function onCancel() {}

export default function FormEditor({
  formMetadata,
  manifest,
  setForm,
}: {
  formMetadata: Partial<FormMetadata>
  manifest: FormManifestWithData
  setForm: (form: FormType) => any
}) {
  const window = useWindowDimensions()
  const padding = Platform.OS === 'web' ? 0.03 : 0
  const ratio = Platform.OS === 'web' ? (window.width > 1000 ? 0.6 : 0.45) : 0
  const boxHeight = Math.round(window.height * 0.85) + 'px'
  const boxWidth = Math.round(window.width * (1 - ratio - padding)) + 'px'
  return (
    <View style={layout.vStack}>
      {Platform.OS !== 'web' ? (
        <View style={[layout.center, spacing.py2]}>
          <Text>Preview: Editing is web-only</Text>
        </View>
      ) : null}
      <View style={[layout.hStackGap3, layout.justifyCenter]}>
        <FormEditorComponent manifest={manifest} setForm={setForm} />
        <View style={{ height: boxHeight, width: boxWidth }}>
          <FormMemo
            // @ts-ignore TODO partial forms should be ok
            formMetadata={formMetadata}
            formManifest={manifest}
            noRenderCache={true}
            onCancel={onCancel}
            disableMenu={true}
            overrideTransformation={'compact'}
          />
        </View>
      </View>
    </View>
  )
}
