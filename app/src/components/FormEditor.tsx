import React, { useEffect, useRef } from 'react'
import { Box, HStack, VStack, Center } from 'native-base'
import { Text } from '@ui-kitten/components'
import { FormType } from 'utils/types/form'
import yaml from 'js-yaml'
import { useWindowDimensions } from 'react-native'
import useDebounce from 'react-use/lib/useDebounce'
import { Platform } from 'react-native'
import Form from 'components/Form'
// @ts-ignore typescript doesn't support .web.js and .native.js files
import CodeEditor from './CodeEditor'
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
import {
  lookupManifest,
  addOrReplaceFileToManifestByFilename,
} from 'utils/manifests'
import { useInfo } from 'utils/errors'
import { getFormTypeFromManifest } from 'utils/manifests'
import FormEditorComponent from 'components/FormEditorComponent'

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

  return (
    <VStack>
      {Platform.OS !== 'web' ? (
        <Center py={2}>
          <Text>Preview: Editing is web-only</Text>
        </Center>
      ) : null}
      <HStack pt="0" space={3} justifyContent="center">
        <FormEditorComponent manifest={manifest} setForm={setForm} />
        <Box
          h={Math.round(window.height * 0.85) + 'px'}
          w={Math.round(window.width * (1 - ratio - padding)) + 'px'}
        >
          <FormMemo
            // @ts-ignore TODO partial forms should be ok
            formMetadata={formMetadata}
            formManifest={manifest}
            noRenderCache={true}
            onCancel={onCancel}
            disableMenu={true}
            overrideTransformation={'compact'}
          />
        </Box>
      </HStack>
    </VStack>
  )
}
