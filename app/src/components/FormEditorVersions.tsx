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
import { useToast } from 'react-native-toast-notifications'
import i18n from 'i18n'

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
  const toast = useToast()

  if (
    !formMetadata.formUUID ||
    !formMetadata.version ||
    !latestVersion.current ||
    !formMetadata.lastChangedDate
  )
    return (
      <Text style={[styleS.py10]}>
        {i18n.t('form-editor.system.features-not-available-yet')}
      </Text>
    )

  if (changed && !historyMode)
    return (
      <Text style={[styleS.py10]}>
        {i18n.t('form-editor.system.history-disabled')}
      </Text>
    )

  async function revertFormToVersion() {
    const params = {
      currentVersion: latestVersion.current,
      oldVersion: formMetadata.version,
      newVersion: parseInt(latestVersion.current!) + 1,
    }
    const ok = window.confirm(
      i18n.t('form-editor.system.reverting-old-version', params)
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
        const msg = i18n.t('form-editor.system.enableToLoadVersion', {
          version,
        })
        toast.show(msg, {
          type: 'danger',
          placement: 'bottom',
          duration: 5000,
        })
      } finally {
        setWaiting(null)
      }
    } else {
      const msg = i18n.t('form-editor.notSavedYet')
      toast.show(msg, {
        type: 'danger',
        placement: 'bottom',
        duration: 5000,
      })
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
  const params = {
    version: formMetadata.version,
    lastChanged: formatDate(formMetadata.lastChangedDate, 'PPP') as string,
  }
  return (
    <>
      <View style={[layout.vStack, spacing.py5]}>
        {historyMode && (
          <View style={styles.formEditorVersionBox}>
            <View style={[layout.center, spacing.py2]}>
              <Text style={[styleS.fontBold]}>
                {i18n.t('form-editor.historyMode')}
              </Text>
              <Text style={[styleS.fontMedium]}>
                {i18n.t('form-editor.system.showingVersionCreatedOn', {
                  params,
                })}
              </Text>
              <Text style={[styleS.fontLight, styleS.pb2]}>
                {i18n.t('form-editor.system.browsFormChangeDisabled')}
              </Text>
              <Button
                style={
                  (styleS.fontBold, styleS.colorCoolGray800, styleS.fontSizeSm)
                }
                status="danger"
                size="small"
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
                {i18n.t('form-editor.makeThisLatestV')}
              </Button>
            </View>
          </View>
        )}
        <View style={[layout.center, spacing.py5]}>
          <Text category="h5">{i18n.t('form-editor.formHistoryBrowser')}</Text>
        </View>
        <View style={[layout.center]}>
          <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
            <FloatingLabelInput
              isReadOnly
              label={i18n.t('form-editor.latestVersion')}
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
                  {i18n.t('form-editor.selectFormVersion')}
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
