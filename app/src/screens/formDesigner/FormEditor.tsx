import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  Box,
  HStack,
  Text,
  VStack,
  Pressable,
  Divider,
  Hidden,
  Select,
  CheckIcon,
} from 'native-base'
import { FormType } from 'utils/types/form'
import { lookupManifestByNameAndType } from 'utils/manifests'
import {
  FormMetadata,
  FormManifest,
  formManifestSchema,
  FormManifestWithData,
} from 'utils/types/formMetadata'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/formDesigner/navigation'
import FormEditorComponent from 'components/FormEditor'
import FormEditorFiles from 'components/FormEditorFiles'
import FormEditorAssociations from 'components/FormEditorAssociations'
import FormEditorPrinted from 'components/FormEditorPrinted'
import FormEditorVersions from 'components/FormEditorVersions'
import FormEditorOverview from 'components/FormEditorOverview'
import _ from 'lodash'
import { readFile } from 'utils/forms'
import { useInfo, handleStandardErrors } from 'utils/errors'
import Loading from 'components/Loading'
import { getForm } from 'api/formdesigner'
import { unpackRemoteData, blobToBase64, base64ArrayBuffer } from 'utils/data'
import {
  addOrReplaceFileToManifestByFilename,
  filetypeIsDataURI,
  makeManifestEntry,
  fetchManifestContents,
} from 'utils/manifests'
import useLeave from 'utils/useLeave'
import { dataURItoBlob } from 'utils/data'

function Tabs({
  tabName,
  setTabName,
}: {
  tabName: string
  setTabName: React.Dispatch<React.SetStateAction<string>>
}) {
  return (
    <Box
      width={{ md: '50%', base: '50%' }}
      _light={{ bg: { base: 'primary.900', md: 'white' } }}
    >
      <Box pl="10" w="2/4" maxW="300">
        <Select
          selectedValue={tabName}
          minWidth="100"
          accessibilityLabel="Select page"
          placeholder="Select page"
          bg="white"
          _selectedItem={{
            bg: 'teal.600',
            endIcon: <CheckIcon size="5" />,
          }}
          mt={1}
          onValueChange={itemValue => setTabName(itemValue)}
        >
          <Select.Item label="Overview" value="Overview" />
          <Select.Item label="Files" value="Files" />
          <Select.Item label="Associations" value="Associations" />
          <Select.Item label="Editor" value="Editor" />
          <Select.Item label="Print preview" value="Printed" />
          <Select.Item label="Versions" value="Versions" />
        </Select>
      </Box>
    </Box>
  )
}

const defaultFormMetadata: Partial<FormMetadata> = {
  'storage-version': '1.0.0',
  country: undefined,
  locationID: undefined,
  language: undefined,
  'official-name': undefined,
  'official-code': '',
  title: undefined,
  subtitle: '',
  priority: undefined,
  enabled: false,
  tags: 'sexual-assault',
  manifestHash: '',
  manifestMD5: '',
  userScopedLocalUUID: '',
  associatedForms: [],
  formUUID: undefined,
  formID: undefined,
  createdDate: undefined,
  createdByUUID: undefined,
  lastChangedDate: undefined,
  lastChangedByUUID: undefined,
  version: undefined,
}

const defaultForm: Partial<FormType> = {
  'storage-version': '1.0.0',
  skipConsent: undefined,
  common: {},
  sections: [],
}

const defaultManifest: FormManifestWithData = {
  'storage-version': '1.0.0',
  contents: [],
  root: '',
}

export default function FormEditor({
  route,
  navigation,
}: RootStackScreenProps<'FormEditor'>) {
  const [historyMode, setHistoryMode] = useState(false)
  const [changed, setChanged] = useState(false)
  const [waiting, setWaiting] = useState(null as null | string)
  const [formMetadata, setFormMetadataRaw] = useState(
    ((route.params && route.params.formMetadata) ||
      defaultFormMetadata) as Partial<FormMetadata>
  )
  const [manifest, setManifestRaw] = React.useState(defaultManifest)
  const latestVersion = useRef(formMetadata.version)

  // This is how we keep track of whether the form has been changed.
  const setFormMetadata = useCallback(
    x => {
      setChanged(true)
      setFormMetadataRaw(x)
    },
    [setFormMetadataRaw]
  )
  const setManifest = useCallback(
    x => {
      setChanged(true)
      setManifestRaw(x)
    },
    [setManifestRaw]
  )

  // Load form on startup
  useEffect(() => {
    const fn = async () => {
      if (route.params && route.params.formMetadata) {
        setWaiting('Loading form')
        const r = await getForm(route.params.formMetadata.formUUID)
        setFormMetadata(r.metadata)
        latestVersion.current = r.metadata.version
        const contents = await fetchManifestContents(r.manifest.contents)
        setManifest({
          'storage-version': '1.0.0',
          root: r.manifest.root,
          contents,
        })
        setWaiting(null)
        setChanged(false)
      }
    }
    fn()
  }, [])

  const [tabName, setTabName] = React.useState('Overview')
  const createMode = !(formMetadata.formUUID && formMetadata.formUUID !== '')

  const setForm = useCallback(
    (form: FormType) => {
      const formData = JSON.stringify(form)
      const entry = makeManifestEntry(formData, 'form.yaml', 'text/yaml', false)
      const e = lookupManifestByNameAndType(manifest, 'form.yaml', 'text/yaml')
      if (entry.sha256 !== (e && e.sha256)) {
        setChanged(true)
        setManifest({
          ...addOrReplaceFileToManifestByFilename(
            manifest,
            formData,
            'form.yaml',
            'text/yaml',
            false
          ),
          root: entry.sha256,
        })
      }
    },
    [manifest]
  )

  let page = null
  switch (tabName) {
    case 'Overview':
      page = (
        <FormEditorOverview
          formMetadata={formMetadata}
          setFormMetadata={setFormMetadata}
          manifest={manifest}
          changed={changed}
          setChanged={setChanged}
          setWaiting={setWaiting}
          latestVersion={latestVersion}
        />
      )
      break
    case 'Files':
      page = (
        <FormEditorFiles
          formMetadata={formMetadata}
          setFormMetadata={setFormMetadata}
          manifest={manifest}
          setManifest={setManifest}
        />
      )
      break
    case 'Associations':
      page = (
        <FormEditorAssociations
          formMetadata={formMetadata}
          setFormMetadata={setFormMetadata}
          manifest={manifest}
          setManifest={setManifest}
        />
      )
      break
    case 'Editor':
      page = (
        <FormEditorComponent
          formMetadata={formMetadata}
          manifest={manifest}
          setForm={setForm}
        />
      )
      break
    case 'Printed':
      page = (
        <FormEditorPrinted
          formMetadata={formMetadata}
          manifest={manifest}
          setManifest={setManifest}
        />
      )
      break
    case 'Versions':
      page = (
        <FormEditorVersions
          formMetadata={formMetadata}
          manifest={manifest}
          changed={changed}
          historyMode={historyMode}
          setHistoryMode={setHistoryMode}
          setFormMetadata={setFormMetadata}
          setManifest={setManifest}
          latestVersion={latestVersion}
          navigation={navigation}
          setChanged={setChanged}
        />
      )
      break
  }

  useLeave(
    navigation,
    changed && !historyMode,
    'Unsaved data',
    'Are you sure you want to leave, unsaved data will be lost. Go to the overview page and click update.',
    () => {}
  )

  return (
    <DashboardLayout
      title={'Form Editor'}
      displaySidebar={false}
      displayScreenTitle={false}
      backButton={true}
      navigation={navigation}
      middlebar={
        waiting || createMode ? (
          <></>
        ) : (
          <Tabs tabName={tabName} setTabName={setTabName} />
        )
      }
      mobileMiddlebar={
        waiting || createMode ? (
          <></>
        ) : (
          <Tabs tabName={tabName} setTabName={setTabName} />
        )
      }
      fullWidth={tabName === 'Editor'}
    >
      <>
        <VStack
          safeAreaBottom
          height="95%"
          borderRadius={{ md: '8' }}
          borderColor="coolGray.200"
          bg={tabName !== 'Editor' ? 'white' : null}
          px={
            tabName === 'Editor'
              ? 0
              : {
                  base: 4,
                  md: 32,
                }
          }
        >
          {page}
        </VStack>
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
