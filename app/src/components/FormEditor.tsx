import React, { useEffect } from 'react'
import { Box, HStack, Text, VStack, Center } from 'native-base'
import { FormType } from 'utils/types/form'
import yaml from 'js-yaml'
import { useWindowDimensions } from 'react-native'
import useDebounce from 'react-use/lib/useDebounce'
import { Platform } from 'react-native'
import Form from 'components/Form'
// @ts-ignore typescript doesn't support .web.js and .native.js files
import CodeEditor from './CodeEditor'
import {
  FormMetadata,
  FormFileWitDataSchema,
  FormManifestWithData,
} from 'utils/types/formMetadata'
import {
  isImage,
  isInManifest,
  filterManifest,
  mapManifest,
  addFileToManifest,
  makeManifestEntry,
  changeFilenameInManifest,
  lookupManifest,
} from 'utils/manifests'

const FormMemo = React.memo(Form)

function onCancel() {}

const defaultForm: FormType = {
  'storage-version': '1.0.0',
  common: {
    gender: [
      { key: 'male', value: 'Male' },
      { key: 'female', value: 'Female' },
      { key: 'transgender', value: 'Transgender' },
    ],
  },
  sections: [
    {
      consent: {
        title: 'Consent',
        parts: [
          {
            'medical-exam': {
              title: 'Authorizing medical exam',
              description:
                'I AUTHORIZE the clinician to conduct a medical examination including a pelvic exam.',
              type: 'bool',
            },
          },
          {
            signature: {
              title: 'Authorizing medical exam',
              type: 'signature',
            },
          },
        ],
      },
    },
  ],
}

export default function FormEditor({
  formMetadata,
  manifest,
  setForm,
}: {
  formMetadata: Partial<FormMetadata>
  manifest: FormManifestWithData
  setForm: (form: FormType) => any
}) {
  const [contents, setContents] = React.useState('' as string)
  const [localForm, setLocalForm] = React.useState({
    'storage-version': '1.0.0',
    common: {},
    sections: [],
  } as FormType)

  const [rawContents, setRawContents] = React.useState(contents)
  // Push text updates to the contents (this is debouncing)
  useDebounce(
    () => {
      setContents(rawContents)
    },
    1000,
    [rawContents]
  )

  // Push contents changes to the manifest
  useEffect(() => {
    try {
      const form = yaml.load(contents) as FormType
      form['storage-version'] = '1.0.0'
      form.common = form.common ? form.common : {}
      form.sections = form.sections ? form.sections : []
      setLocalForm(form)
      setForm(form)
    } catch (e) {
      // TODO Error handling
      console.error(e)
    }
  }, [contents])

  // Pull the initial contents from the manifest
  useEffect(() => {
    try {
      const f = lookupManifest(
        manifest,
        e => e.filetype === 'manifest' && e.filename === 'manifet'
      )
      if (f) {
        const text = yaml.dump(f.data)
        setContents(text)
        setRawContents(text)
      } else {
        const text = yaml.dump(defaultForm)
        setContents(text)
        setRawContents(text)
        setLocalForm(defaultForm)
        setForm(defaultForm)
      }
    } catch (e) {
      // TODO Error handling
      console.error(e)
    }
  }, [])

  const window = useWindowDimensions()
  const padding = Platform.OS === 'web' ? 0.03 : 0
  const ratio = Platform.OS === 'web' ? (window.width > 1000 ? 0.6 : 0.45) : 0

  // TODO files below should be converted to metadata
  return (
    <VStack>
      {Platform.OS !== 'web' ? (
        <Center py={2}>
          <Text>Preview: Editing is web-only</Text>
        </Center>
      ) : null}
      <HStack pt="0" space={3} justifyContent="center">
        <CodeEditor
          ratio={ratio}
          contents={contents}
          window={window}
          setRawContents={setRawContents}
        />
        <Box
          h={Math.round(window.height * 0.85) + 'px'}
          w={Math.round(window.width * (1 - ratio - padding)) + 'px'}
        >
          <FormMemo
            files={{}}
            form={localForm}
            noRenderCache={true}
            onCancel={onCancel}
          />
        </Box>
      </HStack>
    </VStack>
  )
}
