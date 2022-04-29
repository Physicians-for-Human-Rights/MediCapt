import React, { useEffect, useState, useCallback } from 'react'
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
import { md5 } from 'utils/manifests'
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
import FormEditorPrinted from 'components/FormEditorPrinted'
import FormEditorOverview from 'components/FormEditorOverview'
import useMap from 'react-use/lib/useMap'
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
} from 'utils/manifests'

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
      <Hidden from="lg">
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
            <Select.Item label="Editor" value="Editor" />
            <Select.Item label="Print preview" value="Print preview" />
          </Select>
        </Box>
      </Hidden>
      <Hidden till="lg">
        <HStack px={{ base: 4, md: 4 }} mt="2" justifyContent="flex-start">
          <Pressable
            px="5"
            onPress={() => {
              setTabName('Overview')
            }}
            maxW="40%"
          >
            <Text
              fontSize="md"
              fontWeight="medium"
              color={tabName === 'Overview' ? 'black' : 'coolGray.400'}
              selectable={false}
            >
              Overview
            </Text>
            <Box mt="2">
              <Divider
                py="0.5"
                _light={{
                  bg: {
                    base: tabName === 'Overview' ? 'white' : 'primary.900',
                    md: tabName === 'Overview' ? 'primary.900' : 'white',
                  },
                }}
              />
            </Box>
          </Pressable>
          <Pressable
            px="5"
            maxW="25%"
            onPress={() => {
              setTabName('Files')
            }}
          >
            <Text
              fontSize="md"
              fontWeight="medium"
              color={tabName === 'Files' ? 'black' : 'coolGray.400'}
              selectable={false}
            >
              Files
            </Text>
            <Box mt="2">
              <Divider
                py="0.5"
                _light={{
                  bg: {
                    base: tabName === 'Files' ? 'white' : 'primary.900',
                    md: tabName === 'Files' ? 'primary.900' : 'white',
                  },
                }}
              />
            </Box>
          </Pressable>
          <Pressable
            maxW="25%"
            onPress={() => {
              setTabName('Editor')
            }}
            px="5"
          >
            <Text
              fontSize="md"
              fontWeight="medium"
              color={tabName === 'Editor' ? 'black' : 'coolGray.400'}
              selectable={false}
            >
              Editor
            </Text>
            <Box mt="2">
              <Divider
                py="0.5"
                _light={{
                  bg: {
                    base: tabName === 'Editor' ? 'white' : 'primary.900',
                    md: tabName === 'Editor' ? 'primary.900' : 'white',
                  },
                }}
              />
            </Box>
          </Pressable>
          <Pressable
            maxW="25%"
            onPress={() => {
              setTabName('Printed')
            }}
            px="5"
          >
            <Text
              fontSize="md"
              fontWeight="medium"
              color={tabName === 'Printed' ? 'black' : 'coolGray.400'}
              selectable={false}
            >
              Printed
            </Text>
            <Box mt="2">
              <Divider
                py="0.5"
                _light={{
                  bg: {
                    base: tabName === 'Printed' ? 'white' : 'primary.900',
                    md: tabName === 'Printed' ? 'primary.900' : 'white',
                  },
                }}
              />
            </Box>
          </Pressable>
        </HStack>
      </Hidden>
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
  const [changed, setChanged] = useState(false)
  const [waiting, setWaiting] = useState(null as null | string)
  const [formMetadata, setFormMetadataRaw] = useState(
    ((route.params && route.params.formMetadata) ||
      defaultFormMetadata) as Partial<FormMetadata>
  )
  const [manifest, setManifestRaw] = React.useState(defaultManifest)

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
        const contents = await Promise.all(
          _.map(r.manifest.contents, async e => {
            const response = await fetch(e.link)
            const data = filetypeIsDataURI(e.filetype)
              ? await blobToBase64(
                  new Blob([await response.blob()], { type: e.filetype })
                )
              : await response.text()
            return {
              sha256: e.sha256,
              md5: md5(data),
              filename: e.filename,
              data: data,
              filetype: e.filetype,
            }
          })
        )
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
      setChanged(true)
      const formData = JSON.stringify(form)
      const entry = makeManifestEntry(formData, 'form.yaml', 'text/yaml', false)
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
        <FormEditorPrinted formMetadata={formMetadata} manifest={manifest} />
      )
      break
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
      fullWidth={tabName === 'Editor'}
      alertOnBack={changed}
    >
      <>
        <VStack
          safeAreaBottom
          height="95%"
          borderRadius={{ md: '8' }}
          borderColor="coolGray.200"
          bg={tabName !== 'Editor' ? 'white' : null}
          px={{
            base: 4,
            md: 32,
          }}
        >
          {page}
        </VStack>
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
