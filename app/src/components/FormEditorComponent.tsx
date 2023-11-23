import React, { useEffect, useRef } from 'react'
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
import { getFormTypeFromManifest } from 'utils/manifests'
import i18n from 'i18n'

const FormMemo = React.memo(Form)

function onCancel() {}

const defaultForm: FormType = {
  'storage-version': '1.0.0',
  common: {
    gender: [
      { key: 'male', value: i18n.t('gender.male') as string },
      { key: 'female', value: i18n.t('gender.female') as string },
      { key: 'transgender', value: i18n.t('gender.transgender') as string },
    ],
  },
  sections: [
    {
      consent: {
        title: i18n.t('general.consent'),
        parts: [
          {
            'medical-exam': {
              title: i18n.t('form-editor.authorizingMedicalExam'),
              description: i18n.t('form-editor.iAuthorizeMedicalExam'),
              type: 'bool',
            },
          },
          {
            signature: {
              title: i18n.t('form-editor.authorizingMedicalExam'),
              type: 'signature',
            },
          },
        ],
      },
    },
  ],
}

export default function FormEditorComponent({
  manifest,
  setForm,
}: {
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
  const [localManifest, setLocalManifest] = React.useState(manifest)

  // TODO Is there a cleaner way to deal with getting a reference to the raw
  // contents? Could we merge rawContentsRef and setRawContents?
  const rawContentsRef = useRef(rawContents)
  useEffect(() => {
    rawContentsRef.current = rawContents
  }, [rawContents])

  useEffect(() => {
    setLocalManifest(
      addOrReplaceFileToManifestByFilename(
        manifest,
        JSON.stringify(localForm),
        'form.yaml',
        'text/yaml',
        false
      )
    )
  }, [localForm, manifest])

  // Pull the initial contents from the manifest
  useEffect(() => {
    try {
      const f = lookupManifest(
        manifest,
        e => e.filetype === 'text/yaml' && e.filename === 'form.yaml'
      )
      if (f) {
        const text = yaml.dump(JSON.parse(f.data))
        setContents(text)
        setRawContents(text)
      } else {
        const text = yaml.dump(defaultForm)
        setContents(text)
        setRawContents(text)
        setLocalForm(defaultForm)
        setForm(defaultForm)
      }
      // This is important due to the debouncing that we perform with contents and
      // raw contents. Since the for takes some time to render, we want to delay
      // such renders between keystrokes. But when you leave the screen too quickly
      // after typing, you lose your last changes. We check focused on the way out
      // and do a final commit from rawContents to contents and to the form.
      return () => {
        const form = (yaml.load(rawContentsRef.current) || {}) as FormType
        form['storage-version'] = form['storage-version'] || '1.0.0'
        form.common = form.common || {}
        form.sections = form.sections || []
        setLocalForm(form)
        setForm(form)
      }
    } catch (e) {
      // TODO Error handling
      console.error(e)
    }
  }, [])

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
    if (contents) {
      try {
        const form = (yaml.load(contents) || {}) as FormType
        form['storage-version'] = form['storage-version'] || '1.0.0'
        form.common = form.common || {}
        form.sections = form.sections || []
        setLocalForm(form)
        setForm(form)
      } catch (e) {
        // TODO Error handling
        console.error(e)
      }
    }
  }, [contents])

  const window = useWindowDimensions()
  const padding = Platform.OS === 'web' ? 0.03 : 0
  const ratio = Platform.OS === 'web' ? (window.width > 1000 ? 0.6 : 0.45) : 0

  const form = getFormTypeFromManifest(localManifest)
  return (
    form && (
      <CodeEditor
        ratio={ratio}
        contents={contents}
        window={window}
        setRawContents={setRawContents}
      />
    )
  )
}
