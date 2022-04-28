import React, { useState } from 'react'
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
import { createForm, updateForm, commitForm } from 'api/formdesigner'
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
} from 'utils/manifests'
import { dataURItoBlob } from 'utils/data'

export default function FormEditorOverview({
  formMetadata,
  setFormMetadata,
  manifest,
  changed,
}: {
  formMetadata: Partial<FormMetadata>
  setFormMetadata: React.Dispatch<React.SetStateAction<Partial<FormMetadata>>>
  manifest: FormManifestWithData
  changed: boolean
}) {
  const [error, warning, success] = useInfo()
  const [waiting, setWaiting] = useState(null as null | string)
  const standardReporters = { setWaiting, error, warning, success }

  const createMode = !(formMetadata.formUUID && formMetadata.formUUID !== '')

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
      }
    )

  const submitForm = (
    updatedMetadata: Partial<FormMetadata>,
    updatedManifest: FormManifestWithData
  ) =>
    standardHandler(
      standardReporters,
      'Updating form',
      'Form updated',
      async () => {
        // Make sure we don't upload anything other than
        // the minimal manifest by stripping our
        // manifest.
        let manifestData = JSON.stringify(
          formManifestSchema.strip().parse(updatedManifest)
        )
        const remoteMetadata = {
          ...updatedMetadata,
          manifestHash: sha256(manifestData),
          manifestMD5: md5(manifestData),
        }
        const { metadata: newMetadata, manifest: newManifest } =
          await updateForm(
            //@ts-ignore We validate this before the call
            remoteMetadata,
            updatedManifest
          )
        // Upload the parts
        for (const e of newManifest.contents) {
          let form = new FormData()
          for (const field in e.link.fields) {
            form.append(field, e.link.fields[field])
          }
          const blob =
            e.filename === 'manifest' && e.filetype === 'manifest'
              ? new Blob([manifestData], {
                  type: 'text/plain',
                })
              : filetypeIsDataURI(e.filetype)
              ? dataURItoBlob(lookupManifestSHA256(manifest, e.sha256)!.data)
              : new Blob([lookupManifestSHA256(manifest, e.sha256)!.data], {
                  type: e.filetype,
                })
          form.append('file', blob)
          try {
            await fetch(e.link.url, {
              method: 'POST',
              headers: {},
              body: form,
            })
          } catch (err) {
            console.error('Failed to upload', e, err)
          }
        }
        // Upload is finished, commit
        setFormMetadata(
          await commitForm(
            updatedMetadata.formUUID!,
            // @ts-ignore our partial type is verified in the call
            remoteMetadata
          )
        )
      }
    )

  const handleSubmitForm = () => submitForm(formMetadata, manifest)

  const toggleForm = () => {
    const newForm = { ...formMetadata, enabled: !formMetadata.enabled }
    setFormMetadata(newForm)
    submitForm(newForm, manifest)
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
          mb={3}
        />
        <Language
          placeholder={t('form-editor.select-language')}
          value={formMetadata.language}
          setValue={v => setFormMetadata({ ...formMetadata, language: v })}
          mx={3}
          mt={1}
          mb={3}
        />
      </HStack>
      <HStack alignItems="center" justifyContent="space-between">
        <SelectLocation
          bg="white"
          placeholder={t('form-editor.select-location')}
          value={formMetadata.locationID}
          setValue={v => setFormMetadata({ ...formMetadata, locationID: v })}
          any={'1'}
          mx={3}
          mt={1}
          mb={3}
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
      <VStack mt={10} space={3}>
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
          isDone={false}
          todoText="No PDF uploaded"
          doneText="Proper pdf uploaded"
          size={4}
        />
        <NecessaryItem
          isDone={false}
          todoText="Using images that aren't uploaded"
          doneText="All referenced images exist"
          size={4}
        />
        <NecessaryItem
          isDone={false}
          todoText="Errors in the form definition"
          doneText="Form definition is valid"
          size={4}
        />
        <NecessaryItem
          isDone={false}
          todoText="Some parts of the PDF not filled out"
          doneText="All PDF fields covered"
          size={4}
        />
      </VStack>
    </VStack>
  )
}
