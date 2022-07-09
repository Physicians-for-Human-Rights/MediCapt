import React, { useState, useEffect } from 'react'
import {
  HStack,
  VStack,
  CheckIcon,
  Button,
  Badge,
  View,
  Tooltip,
  Icon,
  Center,
  CloseIcon,
} from 'native-base'
import { FormType } from 'utils/types/form'
import FloatingLabelInput from 'components/FloatingLabelInput'
import NecessaryItem from 'components/NecessaryItem'
import {
  FormMetadata,
  formManifestSchema,
  FormManifest,
  FormManifestWithData,
} from 'utils/types/formMetadata'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  Feather,
  MaterialIcons,
} from '@expo/vector-icons'
import { useInfo } from 'utils/errors'
import Loading from 'components/Loading'
import { standardHandler } from 'api/utils'
import { createForm, submitForm } from 'api/formdesigner'
import { t } from 'i18n-js'
import _ from 'lodash'
import AnyCountry from 'components/AnyCountry'
import Language from 'components/Language'
import SelectLocation from 'components/SelectLocation'
import {
  sha256,
  md5,
  lookupManifestSHA256,
  filetypeIsDataURI,
  isInManifest,
  lookupManifest,
} from 'utils/manifests'
import { dataURItoBlob } from 'utils/data'
import yaml from 'js-yaml'

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
    function pathsPartMap(prefix: string, parts: any) {
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
    <VStack>
      <FloatingLabelInput
        label={t('form-editor.title')}
        value={formMetadata.title}
        setValue={v => setFormMetadata({ ...formMetadata, title: v })}
      />
      <FloatingLabelInput
        label={t('form-editor.subtitle-optional')}
        value={formMetadata.subtitle}
        setValue={v => setFormMetadata({ ...formMetadata, subtitle: v })}
      />
      {!createMode && (
        <Center my={2}>
          <NecessaryItem
            isDone={!!formMetadata.enabled}
            todoText="Form is disabled"
            doneText="Form is enabled"
            size={4}
          />
        </Center>
      )}
      <HStack alignItems="center" justifyContent="space-between">
        <FloatingLabelInput
          label={t('form-editor.official-name')}
          w="100%"
          containerW="45%"
          value={formMetadata['official-name']}
          setValue={v =>
            setFormMetadata({ ...formMetadata, 'official-name': v })
          }
        />
        <FloatingLabelInput
          label={t('form-editor.official-code')}
          w="100%"
          containerW="45%"
          value={formMetadata['official-code']}
          setValue={v =>
            setFormMetadata({ ...formMetadata, 'official-code': v })
          }
        />
      </HStack>
      <HStack alignItems="center" justifyContent="space-between">
        <AnyCountry
          placeholder={t('form-editor.select-country')}
          value={formMetadata.country}
          setValue={v => setFormMetadata({ ...formMetadata, country: v })}
          mx={3}
          mt={1}
        />
        <Language
          placeholder={t('form-editor.select-language')}
          value={formMetadata.language}
          setValue={v => setFormMetadata({ ...formMetadata, language: v })}
          mx={3}
          mt={1}
        />
      </HStack>
      <HStack alignItems="center" justifyContent="space-between">
        <SelectLocation
          bg="white"
          placeholder={t('form-editor.select-location')}
          value={formMetadata.locationID}
          setValue={(id, uuid) =>
            setFormMetadata({
              ...formMetadata,
              locationID: id,
              locationUUID: uuid,
            })
          }
          mx={3}
          mt={1}
        />
        <FloatingLabelInput
          label={t('form-editor.priority')}
          w="100%"
          containerW="45%"
          value={formMetadata.priority}
          setValue={v => setFormMetadata({ ...formMetadata, priority: v })}
        />
      </HStack>
      <HStack alignItems="center" justifyContent="space-between">
        <FloatingLabelInput
          label={t('form-editor.created-on')}
          w="100%"
          containerW="45%"
          isReadOnly
          placeholder={
            formMetadata.createdDate
              ? formMetadata.createdDate.toString()
              : 'Not yet created'
          }
        />
        <FloatingLabelInput
          isReadOnly
          label={t('form-editor.last-changed')}
          placeholder={
            formMetadata.lastChangedDate
              ? formMetadata.lastChangedDate.toString()
              : 'Not yet created'
          }
          w="100%"
          containerW="45%"
        />
      </HStack>
      <HStack alignItems="center" justifyContent="space-between">
        <FloatingLabelInput
          label={t('form-editor.version')}
          w="100%"
          containerW="45%"
          isReadOnly
          placeholder={
            formMetadata.version ? formMetadata.version : 'Not yet created'
          }
        />
        <FloatingLabelInput
          label={t('form-editor.id')}
          w="100%"
          containerW="45%"
          isReadOnly
          placeholder={
            formMetadata.formID ? formMetadata.formID : 'Not yet created'
          }
        />
      </HStack>
      <VStack mt={10} space={3} mb={5}>
        <Badge
          variant="solid"
          bg="coolGray.400"
          alignSelf="flex-start"
          _text={{
            color: 'coolGray.50',
            fontWeight: 'bold',
            fontSize: 'xs',
          }}
        >
          FORM CHECKLIST
        </Badge>
        <NecessaryItem
          isDone={isInManifest(manifest, e => e.filename == 'form.yaml')}
          todoText="No form body filled out"
          doneText="Form body exists"
          size={4}
          optional={false}
          help="Click the editor tab and fill in the form body"
        />
        <NecessaryItem
          isDone={_.isEmpty(pathsWithPeriods)}
          todoText="Form has paths with periods in it"
          doneText="From paths have no periods"
          size={4}
          helpHeader="Paths with periods"
          help={
            'Your form has a path with a period. Any text in a form that comes before a colon is part of a path and cannot have a period in it. The following paths have periods in them.' +
            JSON.stringify(pathsWithPeriods)
          }
        />
        <NecessaryItem
          isDone={_.isEmpty(duplicatePaths)}
          todoText="From has duplicate paths"
          doneText="Form paths are unique"
          size={4}
          helpHeader="Dupicate form paths"
          help={
            'Your form has duplicate paths in the definition. You must rename at least one these. ' +
            duplicatePaths
          }
        />
        <NecessaryItem
          isDone={isInManifest(manifest, e => e.filename == 'form.pdf')}
          todoText="No PDF uploaded"
          doneText="PDF uploaded"
          size={4}
          optional={true}
          help="Without a pdf form to fill out we will still generate a pdf with automatic formatting"
        />
        {isInManifest(manifest, e => e.filename == 'form.pdf') && (
          <NecessaryItem
            isDone={false}
            todoText="Some parts of the PDF not filled out"
            doneText="All PDF fields covered"
            size={4}
            help="TODO implement this"
          />
        )}
      </VStack>
      {createMode ? (
        <HStack my={5} justifyContent="center">
          <Button
            leftIcon={<Icon as={MaterialIcons} name="save" size="sm" />}
            colorScheme="green"
            onPress={handleCreateForm}
          >
            {t('form-editor.create-form')}
          </Button>
        </HStack>
      ) : (
        <HStack my={5} justifyContent="space-between">
          <Button
            leftIcon={<Icon as={MaterialIcons} name="save" size="sm" />}
            colorScheme="green"
            onPress={handleSubmitForm}
          >
            {t('form-editor.submit-form')}
          </Button>
          <Tooltip openDelay={0} label="Submit first" isDisabled={!changed}>
            <Button
              leftIcon={
                formMetadata.enabled ? (
                  <CloseIcon size={'5'} mx={2} />
                ) : (
                  <CheckIcon size={'5'} mx={2} />
                )
              }
              colorScheme={formMetadata.enabled ? 'red' : 'green'}
              onPress={toggleForm}
            >
              {formMetadata.enabled
                ? t('form-editor.disable-form')
                : t('form-editor.enable-form')}
            </Button>
          </Tooltip>
        </HStack>
      )}
    </VStack>
  )
}
