import React, { useState } from 'react'
import {
  Text,
  Heading,
  VStack,
  View,
  HStack,
  Center,
  Button,
  Icon,
  Select,
  Box,
} from 'native-base'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { FormType } from 'utils/types/form'
import FloatingLabelInput from 'components/FloatingLabelInput'
// @ts-ignore typescript doesn't do native/web modules
import DisplayPDF from './DisplayPDF'
import {
  FormMetadata,
  FormManifest,
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
  lookupManifestByNameAndType,
  fileExtension,
  fetchManifestContents,
  generateZip,
} from 'utils/manifests'
import _ from 'lodash'
import { getFormVersion } from 'api/formdesigner'
import { useInfo } from 'utils/errors'
import Loading from 'components/Loading'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { submitForm } from 'api/formdesigner'
import { RootStackParamList } from 'utils/formDesigner/navigation'
import { StackNavigationProp } from '@react-navigation/stack'

export default function FormEditorVersions({
  formMetadata,
  manifest,
  setFormMetadata,
  setManifest,
  changed,
  historyMode,
  setHistoryMode,
  setChanged,
  latestVersion,
  navigation,
}: {
  formMetadata: Partial<FormMetadata>
  manifest: FormManifestWithData
  setFormMetadata: React.Dispatch<React.SetStateAction<Partial<FormMetadata>>>
  setManifest: React.Dispatch<React.SetStateAction<FormManifestWithData>>
  changed: boolean
  historyMode: boolean
  setHistoryMode: React.Dispatch<React.SetStateAction<boolean>>
  setChanged: React.Dispatch<React.SetStateAction<Partial<boolean>>>
  latestVersion: React.MutableRefObject<string | undefined>
  navigation: StackNavigationProp<RootStackParamList, 'FormEditor'>
}) {
  const [selectedVersion, setSelectedVersionRaw] = useState(
    formMetadata.version
  )
  const [waiting, setWaiting] = useState(null as null | string)
  const [error, warning, success] = useInfo()
  const standardReporters = { setWaiting, error, warning, success }

  if (
    !formMetadata.formUUID ||
    !formMetadata.version ||
    !latestVersion.current ||
    !formMetadata.lastChangedDate
  )
    return (
      <Text py={10}>
        These features are only available after you create the form for the
        first time.
      </Text>
    )

  if (changed && !historyMode)
    return (
      <Text py={10}>
        History browsing is only enabled when the form is unchanged.
      </Text>
    )

  async function revertFormToVersion() {
    const ok = window.confirm(
      'Reverting to a previous version will create a copy of that previous version. Now, the Form is at version ' +
        latestVersion.current +
        '. We will revert to version ' +
        formMetadata.version +
        ' by creating a new version, ' +
        (parseInt(latestVersion.current!) + 1) +
        ' that is a copy of of ' +
        formMetadata.version +
        '. Are you sure you want to do this?'
    )
    if (!ok) return
    // NB The server will reject our update to the form if we submit the
    // metadata of an old version. If the form is at version X, it only accepts
    // metdata updates tagged with version X to prevent race conditions. So to
    // revert, we tag an old version with the latest version number and subm it; telling the server we know that new data exists but want to ignore it.
    formMetadata.version = latestVersion.current!
    await submitForm(
      formMetadata,
      manifest,
      standardReporters,
      setFormMetadata,
      () => {},
      () => {
        setHistoryMode(false)
        setChanged(false)
        if (latestVersion.current) {
          setSelectedVersionRaw(latestVersion.current + 1)
          latestVersion.current = '' + (parseInt(latestVersion.current) + 1)
        }
      }
    )
  }

  async function loadForm(version: string) {
    if (formMetadata.formUUID && version) {
      try {
        setWaiting('Loading form')
        const r = await getFormVersion(formMetadata.formUUID!, version!)
        const contents = await fetchManifestContents(r.manifest.contents)
        setHistoryMode(true)
        setFormMetadata(r.metadata)
        setManifest({
          'storage-version': '1.0.0',
          root: r.manifest.root,
          contents,
        })
      } catch (e) {
        error('Could not load form version ' + version)
      } finally {
        setWaiting(null)
      }
    } else {
      error('This form has not been saved on the server yet')
    }
  }

  async function setSelectedVersion(v: string) {
    setSelectedVersionRaw(v)
    await loadForm(v)
    if (v === latestVersion.current) {
      setChanged(false)
      setHistoryMode(false)
    }
  }

  return (
    <>
      <VStack space={0} py={5}>
        {historyMode && (
          <Box bg={'primary.50'} rounded="8">
            <Center py={2}>
              <Text fontWeight="bold">History mode</Text>
              <Text fontWeight="medium">
                Showing Version {formMetadata.version} created on{' '}
                {formatDate(formMetadata.lastChangedDate, 'PPP')}
              </Text>
              <Text fontWeight="light" pb={2}>
                You cannot make changes, but you can browse the form. Leave the
                from an come back to reset.
              </Text>
              <Button
                fontWeight="bold"
                color="coolGray.800"
                bg="error.500"
                fontSize="sm"
                size="sm"
                onPress={() =>
                  revertFormToVersion(
                    formMetadata,
                    manifest,
                    standardReporters,
                    setFormMetadata,
                    () => {}
                  )
                }
                leftIcon={
                  <Icon as={Feather} name="alert-triangle" size="xsm" />
                }
              >
                Make this the latest version
              </Button>
            </Center>
          </Box>
        )}
        <Center py={5}>
          <Heading size="md">Form history browser</Heading>
        </Center>
        <Center>
          <HStack alignItems="center" justifyContent="space-between">
            <FloatingLabelInput
              isReadOnly
              label={'Latest version'}
              placeholder={latestVersion.current}
              w="300px"
              containerW="45%"
            />
          </HStack>
        </Center>
        <Center>
          <Box
            borderColor={'muted.100'}
            bg={'muted.50'}
            borderWidth={2}
            rounded="8"
            p={3}
          >
            <HStack space={10}>
              <Center>
                <Text pt={1}>Select a version of the form to load</Text>
              </Center>
              <Select
                selectedValue={selectedVersion}
                minWidth="100"
                accessibilityLabel="Select version"
                bg="white"
                mt={1}
                onValueChange={setSelectedVersion}
              >
                {_.map(_.range(1, 1 + parseInt(latestVersion.current)), v => (
                  <Select.Item label={'Version ' + v} value={'' + v} />
                ))}
              </Select>
            </HStack>
          </Box>
        </Center>
      </VStack>
      <Loading loading={waiting} />
    </>
  )
}
