import React, { useState, useEffect, useCallback } from 'react'
import { VStack } from 'native-base'
import _ from 'lodash'
import Form from 'components/Form'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/provider/navigation'
import { FormManifestWithData } from 'utils/types/formMetadata'
import Loading from 'components/Loading'
import {
  RecordManifestWithData,
  recordManifestWithDataSchema,
} from 'utils/types/recordMetadata'
import { useInfo, handleStandardErrors } from 'utils/errors'
import {
  createRecord,
  getForm,
  getFormManifestContents,
  getRecord,
  getRecordManifestContents,
  updateRecord,
  sealRecord,
} from '../../utils/localStore/store'
import { RecordType } from 'utils/types/record'
import {
  addFileToManifest,
  addOrReplaceRecordTypeInManifest,
  removeFileFromManifestSHA256,
} from 'utils/manifests'

const FormMemo = React.memo(Form)

export default function RecordEditor({
  route,
  navigation,
}: RootStackScreenProps<'RecordEditor'>) {
  const [waiting, setWaiting] = useState('Loading' as null | string)
  const [error, warning, success] = useInfo()

  // Either formMetadata or recordMetadata passed to the RecordEditor as route params
  const [formMetadata, setFormMetadata] = useState(
    'formMetadata' in route.params ? route.params.formMetadata : undefined
  )
  const [recordMetadata, setRecordMetadata] = useState(
    'recordMetadata' in route.params ? route.params.recordMetadata : undefined
  )
  const [formManifest, setFormManifest] = useState(
    undefined as FormManifestWithData | undefined
  )
  const [recordManifest, setRecordManifest] = useState(
    undefined as RecordManifestWithData | undefined
  )

  // Load record and associated form on startup
  useEffect(() => {
    const fetchData = async () => {
      setWaiting('Loading')

      try {
        // Load Record
        const recordResponse =
          recordMetadata && (await getRecord(recordMetadata.recordUUID))

        if (recordResponse) {
          const contentsWithData = await getRecordManifestContents(
            recordResponse.manifest.contents
          )

          if (!_.isEqual(recordMetadata, recordResponse.metadata))
            setRecordMetadata(recordResponse.metadata)
          setRecordManifest({
            'storage-version': '1.0.0',
            root: recordResponse.manifest.root,
            contents: contentsWithData,
          })
        }

        // The input record overrides any form information that may have been provided.
        const formUUID =
          recordResponse?.metadata.formUUID || formMetadata?.formUUID

        // Load Form
        const formResponse = formUUID && (await getForm(formUUID))

        if (formResponse) {
          const contentsWithData = await getFormManifestContents(
            formResponse.manifest.contents
          )

          if (!_.isEqual(formMetadata, formResponse.metadata))
            setFormMetadata(formResponse.metadata)
          setFormManifest({
            'storage-version': '1.0.0',
            root: formResponse.manifest.root,
            contents: contentsWithData,
          })
        } else {
          throw Error('TODO Missing form!')
        }
      } catch (e) {
        handleStandardErrors(error, warning, success, e)
      } finally {
        setWaiting(null)
      }
    }

    fetchData()
  }, [])

  const addPhotoToManifest = useCallback((uri: string) => {
    const fileType = uri.split(',')[0].split(':')[1].split(';')[0]

    if (fileType !== 'image/webp') throw Error('Photo must be in webp format.')

    setRecordManifest(recordManifest =>
      addFileToManifest(
        recordManifest || {
          'storage-version': '1.0.0',
          contents: [],
          root: '',
        },
        uri,
        new Date().toUTCString(),
        'image/webp',
        true
      )
    )
  }, [])

  const removePhotoFromManifest = useCallback((sha256: string) => {
    setRecordManifest(recordManifest =>
      removeFileFromManifestSHA256(
        recordManifest || {
          'storage-version': '1.0.0',
          contents: [],
          root: '',
        },
        sha256
      )
    )
  }, [])

  const onSaveAndExit = useCallback(
    (record: RecordType) => {
      const handleSaveAndExit = async () => {
        try {
          if (!formMetadata) throw Error('Missing form!')

          // Get previous record manifest and metadata; or if none exist, create them
          const oldRecordManifest = recordManifest || {
            'storage-version': '1.0.0',
            contents: [],
            root: '',
          }
          const oldRecordMetadata =
            recordMetadata ||
            (await createRecord({
              'storage-version': '1.0.0',
              formUUID: formMetadata.formUUID,
              formID: formMetadata.formID,
              formVersion: formMetadata.version,
              locationID: formMetadata.locationID,
              patientName: '',
              patientGender: '',
              patientAddress: '',
              patientDateOfBirth: new Date('January 01 1001'), // TODO Do better
              patientPhoneNumber: '',
              patientEmail: '',
              incidentDate: new Date('January 01 1001'), // TODO Do better
              caseId: '',
              manifestHash: '',
              manifestMD5: '',
            }))

          // Update manifest and metadata with the record that we want to save
          const updatedRecordManifest = addOrReplaceRecordTypeInManifest(
            oldRecordManifest,
            record
          )
          await updateRecord(oldRecordMetadata, updatedRecordManifest)

          navigation.goBack()
        } catch (e) {
          handleStandardErrors(error, warning, success, e)
        } finally {
          setWaiting(null)
        }
      }

      setWaiting('Loading')
      handleSaveAndExit()
    },
    [formMetadata, recordMetadata, recordManifest]
  )

  const onComplete = useCallback(
    (record: RecordType) => {
      const handleComplete = async () => {
        try {
          if (!formMetadata) throw Error('Missing form!')

          // Get previous record manifest and metadata; or if none exist, create them
          const oldRecordManifest =
            recordManifest ||
            recordManifestWithDataSchema.parse({
              'storage-version': '1.0.0',
              contents: [],
              root: '',
            })
          const oldRecordMetadata =
            recordMetadata ||
            (await createRecord({
              'storage-version': '1.0.0',
              formUUID: formMetadata.formUUID,
              formID: formMetadata.formID,
              formVersion: formMetadata.version,
              locationID: formMetadata.locationID,
              patientName: '',
              patientGender: '',
              patientAddress: '',
              patientDateOfBirth: new Date('January 01 1001'), // TODO Do better
              patientPhoneNumber: '',
              patientEmail: '',
              incidentDate: new Date('January 01 1001'), // TODO Do better
              caseId: '',
              manifestHash: '',
              manifestMD5: '',
            }))

          // Update manifest and metadata with the record that we want to save
          const updatedRecordManifest = addOrReplaceRecordTypeInManifest(
            oldRecordManifest,
            record
          )
          const updatedRecordMetadata = await updateRecord(
            oldRecordMetadata,
            updatedRecordManifest
          )

          // Seal updated record
          await sealRecord(updatedRecordMetadata.recordUUID)

          navigation.goBack()
        } catch (e) {
          handleStandardErrors(error, warning, success, e)
        } finally {
          setWaiting(null)
        }
      }

      setWaiting('Loading')
      handleComplete()
    },
    [formMetadata, recordMetadata, recordManifest]
  )

  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title="Fill out a record"
      displayHeader={false}
      fullWidth={true}
    >
      <>
        <VStack
          safeAreaBottom
          flex={1}
          borderRadius={{ md: '8' }}
          borderColor="coolGray.200"
          bg={'white'}
          px={{
            base: 0,
            md: 0,
          }}
        >
          {formMetadata &&
            formManifest &&
            (!recordMetadata || recordManifest) && (
              <FormMemo
                formMetadata={formMetadata}
                formManifest={formManifest}
                recordMetadata={recordMetadata}
                setRecordMetadata={setRecordMetadata}
                recordManifest={recordManifest}
                addPhotoToManifest={addPhotoToManifest}
                removePhotoFromManifest={removePhotoFromManifest}
                onCancel={() => navigation.goBack()}
                onSaveAndExit={onSaveAndExit}
                onComplete={onComplete}
              />
            )}
        </VStack>
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
