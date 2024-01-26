import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Select, SelectItem, IndexPath } from '@ui-kitten/components'
import { FormType } from 'utils/types/form'
import { lookupManifestByNameAndType } from 'utils/manifests'
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/formDesigner/navigation'
import FormEditorComponent from 'components/FormEditor'
import FormEditorFiles from 'components/FormEditorFiles'
import FormEditorAssociations from 'components/FormEditorAssociations'
import FormEditorPrinted from 'components/FormEditorPrinted'
import FormEditorVersions from 'components/FormEditorVersions'
import FormEditorOverview from 'components/FormEditorOverview'
import _ from 'lodash'
import Loading from 'components/Loading'
import { getForm } from 'api/formdesigner'
import {
  addOrReplaceFileToManifestByFilename,
  filetypeIsDataURI,
  makeManifestEntry,
  fetchManifestContents,
} from 'utils/manifests'
import useLeave from 'utils/useLeave'
import { Dimensions, View, SafeAreaView } from 'react-native'
import styles from '../../components/styles'
import { breakpoints, colors } from '../../components/nativeBaseSpec'
import { CheckIcon } from '../../components/Icons'
import { useStoreState } from 'utils/store'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md

function Tabs({
  tabName,
  setTabName,
}: {
  tabName: string
  setTabName: React.Dispatch<React.SetStateAction<string>>
}) {
  const state = useStoreState()
  const i18n = state?.i18n
  const items = [
    { label: i18n.t('general.overview'), val: 'Overview' },
    { label: i18n.t('general.files'), val: 'Files' },
    { label: i18n.t('general.associations'), val: 'Associations' },
    { label: i18n.t('general.editor'), val: 'Editor' },
    { label: i18n.t('form.print-preview'), val: 'Printed' },
    { label: i18n.t('general.versions'), val: 'Versions' },
  ]
  const foundIndex = items.findIndex(item => item.val === tabName)
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>(
    new IndexPath(foundIndex)
  )
  const onSelect = (index: IndexPath) => {
    setSelectedIndex(index)
    setTabName(items[index.row].val)
  }
  return (
    <View
      style={{
        width: '50%',
        backgroundColor: isWider ? 'white' : colors.primary[900],
      }}
    >
      <View style={styles.formEditorFormdesigner}>
        <Select
          // selectedValue={tabName}
          selectedIndex={selectedIndex}
          style={{ minWidth: 100, backgroundColor: 'white', marginTop: 4 }}
          aria-label={i18n.t('common.select-page')}
          placeholder={i18n.t('common.select-page')}
          // _selectedItem={{
          //   bg: 'teal.600',
          //   endIcon: <CheckIcon size="5" />,
          // }}
          accessoryLeft={CheckIcon}
          onSelect={index => onSelect(index as IndexPath)}
        >
          {items.map(item => {
            return <SelectItem key={item.val} title={item.label} />
          })}
        </Select>
      </View>
    </View>
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

// const defaultForm: Partial<FormType> = {
//   'storage-version': '1.0.0',
//   skipConsent: undefined,
//   common: {},
//   sections: [],
// }

const defaultManifest: FormManifestWithData = {
  'storage-version': '1.0.0',
  contents: [],
  root: '',
}

export default function FormEditor({
  route,
  navigation,
}: RootStackScreenProps<'FormEditor'>) {
  const state = useStoreState()
  const i18n = state?.i18n
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
    (x: any) => {
      setChanged(true)
      setFormMetadataRaw(x)
    },
    [setFormMetadataRaw]
  )
  const setManifest = useCallback(
    (x: any) => {
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

  const [tabName, setTabName] = React.useState(i18n.t('general.overview'))
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
  // have to use enum here to avoid localization string may mismatch
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
          setForm={setForm}
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
  const pxVal =
    tabName === 'Editor' || tabName === 'Printed' ? 0 : isWider ? 32 : 4
  const localStyle = {
    borderRadius: isWider ? 8 : 0,
    backgroundColor: tabName !== 'Editor' ? 'white' : 'transparent',
    paddingHorizontal: pxVal,
  }
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
      fullWidth={tabName === 'Editor' || tabName === 'Printed'}
    >
      <>
        <SafeAreaView style={[styles.formEditorDesignerView, localStyle]}>
          {page}
        </SafeAreaView>
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
