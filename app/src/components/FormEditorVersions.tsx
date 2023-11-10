import React, { useState } from 'react'
import { View } from 'react-native'
import {
  Text,
  useStyleSheet,
  Button,
  Select,
  SelectItem,
  IndexPath,
} from '@ui-kitten/components'
import themedStyles from '../themeStyled'
import FloatingLabelInput from 'components/FloatingLabelInput'
// @ts-ignore typescript doesn't do native/web modules
import {
  FormMetadata,
  FormManifest,
  FormManifestWithData,
} from 'utils/types/formMetadata'
import { fetchManifestContents } from 'utils/manifests'
import _ from 'lodash'
import { getFormVersion } from 'api/formdesigner'
import { useInfo } from 'utils/errors'
import Loading from 'components/Loading'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { submitForm } from 'api/formdesigner'
import { RootStackParamList } from 'utils/formDesigner/navigation'
import { StackNavigationProp } from '@react-navigation/stack'
import styles, { layout, spacing } from './styles'
import { AlertIcon } from './Icons'

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
  const styleS = useStyleSheet(themedStyles)
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
      <Text style={[styleS.py10]}>
        These features are only available after you create the form for the
        first time.
      </Text>
    )

  if (changed && !historyMode)
    return (
      <Text style={[styleS.py10]}>
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

  async function setSelectedVersion(index: IndexPath | IndexPath[]) {
    if (!Array.isArray(index)) {
      const v =
        latestVersion?.current?.length && latestVersion.current[index.row]
      setSelectedVersionRaw(v + '')
      await loadForm(v + '')
      if (v === latestVersion.current) {
        setChanged(false)
        setHistoryMode(false)
      }
    }
  }

  return (
    <>
      <View style={[layout.vStack, spacing.py5]}>
        {historyMode && (
          <View style={styles.formEditorVersionBox}>
            <View style={[layout.center, spacing.py2]}>
              <Text style={[styleS.fontBold]}>History mode</Text>
              <Text style={[styleS.fontMedium]}>
                Showing Version {formMetadata.version} created on{' '}
                {formatDate(formMetadata.lastChangedDate, 'PPP') as string}
              </Text>
              <Text style={[styleS.fontLight, styleS.pb2]}>
                You cannot make changes, but you can browse the form. Leave the
                from an come back to reset.
              </Text>
              <Button
                style={
                  (styleS.fontBold, styleS.colorCoolGray800, styleS.fontSizeSm)
                }
                status="danger"
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
                accessoryLeft={AlertIcon}
              >
                Make this the latest version
              </Button>
            </View>
          </View>
        )}
        <View style={[layout.center, spacing.py5]}>
          <Text category="h5">Form history browser</Text>
        </View>
        <View style={[layout.center]}>
          <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
            <FloatingLabelInput
              isReadOnly
              label={'Latest version'}
              placeholder={latestVersion.current}
              w="300px"
              containerW="45%"
            />
          </View>
        </View>
        <View style={[layout.center]}>
          <View style={styles.formEditorVersionBoxCenter}>
            <View style={[layout.hStackGap10]}>
              <View style={[layout.center]}>
                <Text style={[styleS.pt1]}>
                  Select a version of the form to load
                </Text>
              </View>
              <Select
                value={selectedVersion}
                aria-label="Select version"
                onSelect={setSelectedVersion}
                style={[styleS.minWidth100, styleS.bgWhite, styleS.mt1]}
              >
                {_.map(_.range(1, 1 + parseInt(latestVersion.current)), v => (
                  <SelectItem title={'Version ' + v} />
                ))}
              </Select>
            </View>
          </View>
        </View>
      </View>
      <Loading loading={waiting} />
    </>
  )
}
