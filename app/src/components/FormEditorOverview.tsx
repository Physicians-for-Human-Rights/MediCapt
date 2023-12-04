import React, { useState, useEffect } from 'react'
import FloatingLabelInput from 'components/FloatingLabelInput'
import NecessaryItem from 'components/NecessaryItem'
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
import { useInfo } from 'utils/errors'
import { standardHandler } from 'api/utils'
import { createForm, submitForm } from 'api/formdesigner'
import { useStoreState } from '../utils/store'
import _ from 'lodash'
import AnyCountry from 'components/AnyCountry'
import Language from 'components/Language'
import SelectLocation from 'components/SelectLocation'
import { isInManifest, lookupManifest } from 'utils/manifests'
import { Button, Text } from '@ui-kitten/components'
import { SaveIcon, CloseIcon, CheckIcon } from './Icons'
import { layout, spacing } from './styles'
import { View } from 'react-native'

export function listDuplicates<T>(arr: T[]): T[] {
  return _.uniq(
    _.filter(arr, (val, i, iteratee) => _.includes(iteratee, val, i + 1))
  )
}

export function getFormPathsAndInfo(manifest: FormManifestWithData) {
  const f = lookupManifest(
    manifest,
    e => e.filetype === 'text/yaml' && e.filename === 'form.yaml'
  )
  if (f) {
    let pathsWithPeriods: { prefix: string; path: string }[] = []
    const allPaths: string[] = []
    function pathsPartMaΩp(prefix: string, parts: any) {
      for (const key in parts) {
        if (_.includes(key, '.')) pathsWithPeriods.push({ prefix, path: key })
        paths(prefix + '.' + key, parts[key])
      }
    }
    function paths(prefix: string, data: any) {
      if (_.isArray(data)) {
        for (const e of data) {
          paths(prefix, e)
        }
      } else if (_.isObject(data)) {
        if ('type' in data) {
          allPaths.push(prefix)
          if (
            'show-parts-when-true' in data &&
            _.isArray(data['show-parts-when-true'])
          ) {
            paths(prefix + '.parts', data['show-parts-when-true'])
          }
          if ('list-with-parts' === data.type) {
            pathsPartMap(prefix, data.options)
          }
          if ('parts' in data && _.isArray(data.parts)) {
            pathsPartMap(prefix, data.parts)
          }
        } else {
          for (const key in data) {
            if (_.includes(key, '.'))
              pathsWithPeriods.push({ prefix, path: key })
            paths(prefix ? prefix + '.' + key : key, data[key])
          }
        }
      }
    }
    const data = JSON.parse(f.data)
    paths('', data)
    return { paths: allPaths, pathsWithPeriods }
  }
  return { paths: [], pathsWithPeriods: [] }
}

export default function FormEditorOverview({
  formMetadata,
  setFormMetadata,
  manifest,
  changed,
  setChanged,
  setWaiting,
  latestVersion,
}: {
  formMetadata: Partial<FormMetadata>
  setFormMetadata: React.Dispatch<React.SetStateAction<Partial<FormMetadata>>>
  manifest: FormManifestWithData
  changed: boolean
  setChanged: React.Dispatch<React.SetStateAction<Partial<boolean>>>
  setWaiting: React.Dispatch<React.SetStateAction<Partial<string | null>>>
  latestVersion: React.MutableRefObject<string | undefined>
}) {
  const state = useStoreState()
  const i18n = state?.i18n
  const [error, warning, success] = useInfo()
  const standardReporters = { setWaiting, error, warning, success }
  const createMode = !(formMetadata.formUUID && formMetadata.formUUID !== '')

  const [duplicatePaths, setDuplicatePaths] = useState([] as string[])
  const [pathsWithPeriods, setPathsWithPeriods] = useState(
    [] as { prefix: string; path: string }[]
  )
  useEffect(() => {
    const r = getFormPathsAndInfo(manifest)
    setDuplicatePaths(listDuplicates(r.paths))
    setPathsWithPeriods(r.pathsWithPeriods)
  }, [manifest])

  const handleCreateForm = () =>
    standardHandler(
      standardReporters,
      'Creating form',
      'Form created',
      async () => {
        setFormMetadata(
          await createForm(
            //@ts-ignore We validate this before the call
            formMetadata
          )
        )
        setChanged(false)
        latestVersion.current = '1'
      }
    )

  const submitFormWrapper = (
    updatedMetadata: Partial<FormMetadata>,
    updatedManifest: FormManifestWithData
  ) =>
    submitForm(
      updatedMetadata,
      updatedManifest,
      standardReporters,
      setFormMetadata,
      setChanged,
      () => {
        latestVersion.current = '' + (parseInt(latestVersion.current!) + 1)
      }
    )

  const handleSubmitForm = () => submitFormWrapper(formMetadata, manifest)

  const toggleForm = () => {
    const newForm = { ...formMetadata, enabled: !formMetadata.enabled }
    setFormMetadata(newForm)
    submitFormWrapper(newForm, manifest)
  }

  return (
    <View style={layout.vStack}>
      <FloatingLabelInput
        label={i18n.t('form-editor.title')}
        value={formMetadata.title}
        setValue={v => setFormMetadata({ ...formMetadata, title: v })}
      />
      <FloatingLabelInput
        label={i18n.t('form-editor.subtitle-optional')}
        value={formMetadata.subtitle}
        setValue={v => setFormMetadata({ ...formMetadata, subtitle: v })}
      />
      {!createMode && (
        <View style={[layout.center, spacing.my2]}>
          <NecessaryItem
            isDone={!!formMetadata.enabled}
            todoText={i18n.t('form-editor.disabled')}
            doneText={i18n.t('form-editor.enabled')}
            size="tiny"
          />
        </View>
      )}
      <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
        <FloatingLabelInput
          label={i18n.t('form-editor.official-name')}
          w="100%"
          containerW="45%"
          value={formMetadata['official-name']}
          setValue={v =>
            setFormMetadata({ ...formMetadata, 'official-name': v })
          }
        />
        <FloatingLabelInput
          label={i18n.t('form-editor.official-code')}
          w="100%"
          containerW="45%"
          value={formMetadata['official-code']}
          setValue={v =>
            setFormMetadata({ ...formMetadata, 'official-code': v })
          }
        />
      </View>
      <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
        <AnyCountry
          placeholder={i18n.t('form-editor.select-country')}
          value={formMetadata.country}
          setValue={v => setFormMetadata({ ...formMetadata, country: v })}
          // mx={3}
          // mt={1}
        />
        <Language
          value={formMetadata.language}
          setValue={v => setFormMetadata({ ...formMetadata, language: v })}
          // mx={3}
          // mt={1}
        />
      </View>
      <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
        <SelectLocation
          bg="white"
          placeholder={i18n.t('form-editor.select-location')}
          value={formMetadata.locationID}
          setValue={(id, uuid) =>
            setFormMetadata({
              ...formMetadata,
              locationID: id,
              locationUUID: uuid,
            })
          }
          // mx={3}
          // mt={1}
        />
        <FloatingLabelInput
          label={i18n.t('form-editor.priority')}
          w="100%"
          containerW="45%"
          value={formMetadata.priority}
          setValue={v => setFormMetadata({ ...formMetadata, priority: v })}
        />
      </View>
      <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
        <FloatingLabelInput
          label={i18n.t('form-editor.created-on')}
          w="100%"
          containerW="45%"
          isReadOnly
          placeholder={
            formMetadata.createdDate
              ? formMetadata.createdDate.toString()
              : i18n.t('user.not-yet-created')
          }
        />
        <FloatingLabelInput
          isReadOnly
          label={i18n.t('form-editor.last-changed')}
          placeholder={
            formMetadata.lastChangedDate
              ? formMetadata.lastChangedDate.toString()
              : i18n.t('user.not-yet-created')
          }
          w="100%"
          containerW="45%"
        />
      </View>
      <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
        <FloatingLabelInput
          label={i18n.t('form-editor.version')}
          w="100%"
          containerW="45%"
          isReadOnly
          placeholder={
            formMetadata.version
              ? formMetadata.version
              : i18n.t('user.not-yet-created')
          }
        />
        <FloatingLabelInput
          label={i18n.t('form-editor.id')}
          w="100%"
          containerW="45%"
          isReadOnly
          placeholder={
            formMetadata.formID
              ? formMetadata.formID
              : i18n.t('user.not-yet-created')
          }
        />
      </View>
      <View style={[layout.vStackGap3, spacing.mt10, spacing.mb5]}>
        <Button
          size="tiny"
          status="coolGray" // make this no onhover effect
          // bg="coolGray.400"
          // alignSelf="flex-start"
          // _text={{
          //   color: 'coolGray.50',
          //   fontWeight: 'bold',
          //   fontSize: 'xs',
          // }}
        >
          {i18n.t('form-editor.formChecklist')}
        </Button>
        <NecessaryItem
          isDone={isInManifest(manifest, e => e.filename == 'form.yaml')}
          todoText={i18n.t('form-editor.system.noFormBodyFilled')}
          doneText={i18n.t('form-editor.system.formBodyExists')}
          size="tiny"
          optional={false}
          help={i18n.t('form-editor.system.clickEditorTabAndFillForm')}
        />
        <NecessaryItem
          isDone={_.isEmpty(pathsWithPeriods)}
          todoText={i18n.t('form-editor.system.formPathsHasPeriods')}
          doneText={i18n.t('form-editor.system.formPathNoPeriod')}
          size="tiny"
          helpHeader={i18n.t('form-editor.system.pathWithPeriods')}
          help={i18n.t('form-editor.system.pathWithPeriods', {
            path: JSON.stringify(pathsWithPeriods),
          })}
        />
        <NecessaryItem
          isDone={_.isEmpty(duplicatePaths)}
          todoText={i18n.t('form-editor.system.pathNotUnique')}
          doneText={i18n.t('form-editor.system.pathsUnique')}
          size="tiny"
          helpHeader={i18n.t('form-editor.system.duplicateFormPath')}
          help={i18n.t('form-editor.system.duplicateFormPath', {
            path: duplicatePaths,
          })}
        />
        <NecessaryItem
          isDone={isInManifest(manifest, e => e.filename == 'form.pdf')}
          todoText={i18n.t('form-editor.system.noPdfUploaded')}
          doneText={i18n.t('form-editor.system.pdfUploaded')}
          size="tiny"
          optional={true}
          help={i18n.t('form-editor.system.pdfWillBeGenerated')}
        />
        {isInManifest(manifest, e => e.filename == 'form.pdf') && (
          <NecessaryItem
            isDone={false}
            todoText={i18n.t('form-editor.system.pdfNotFullyFilled')}
            doneText={i18n.t('form-editor.system.pdfFullyFilled')}
            size="tiny"
            help="TODO implement this"
          />
        )}
      </View>
      {createMode ? (
        <View style={[layout.hStack, layout.justifyCenter, spacing.my5]}>
          <Button
            accessoryLeft={SaveIcon}
            status="success"
            onPress={handleCreateForm}
          >
            {i18n.t('form-editor.create-form')}
          </Button>
        </View>
      ) : (
        <View style={[layout.hStack, layout.spaceBet, spacing.my5]}>
          <Button
            accessoryLeft={SaveIcon}
            status="success"
            onPress={handleSubmitForm}
          >
            {i18n.t('form-editor.submit-form')}
          </Button>

          {changed && <Text category="p1">*Submit first</Text>}

          <Button
            accessoryLeft={formMetadata.enabled ? CloseIcon : CheckIcon}
            status={formMetadata.enabled ? 'danger' : 'success'}
            onPress={toggleForm}
          >
            {formMetadata.enabled
              ? i18n.t('form-editor.disable-form')
              : i18n.t('form-editor.enable-form')}
          </Button>
        </View>
      )}
    </View>
  )
}
