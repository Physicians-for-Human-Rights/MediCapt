import React, { useState, useEffect, useCallback, useRef } from 'react'
import { VStack } from 'native-base'
import _ from 'lodash'
import Form from 'components/Form'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/provider/navigation'
import { FormManifestWithData } from 'utils/types/formMetadata'
import Loading from 'components/Loading'
import {
  RecordMetadata,
  RecordManifestWithData,
} from 'utils/types/recordMetadata'
import { useInfo, handleStandardErrors } from 'utils/errors'
import {
  createRecord,
  getForm,
  getFormVersion,
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
  imageExtension,
} from 'utils/manifests'
import uuid from 'react-native-uuid'
import useLeave from 'utils/useLeave'
import confirmationDialog from 'utils/confirmationDialog'

const FormMemo = React.memo(Form)

export default function RecordEditor({
  route,
  navigation,
}: RootStackScreenProps<'RecordEditor'>) {
  const [changed, setChanged] = useState(false)
  const [waiting, setWaiting] = useState('Loading' as null | string)
  const [error, warning, success] = useInfo()

  // Either formMetadata or recordMetadata passed to the RecordEditor as route params
  const [formMetadata, setFormMetadata] = useState(
    'formMetadata' in route.params ? route.params.formMetadata : undefined
  )
  const [recordMetadata, setRecordMetadataRaw] = useState(
    'recordMetadata' in route.params ? route.params.recordMetadata : undefined
  )
  const [formManifest, setFormManifest] = useState(
    undefined as FormManifestWithData | undefined
  )
  const [recordManifest, setRecordManifestRaw] = useState(
    // @ts-ignore TODO metadata
    {
      'storage-version': '1.0.0',
      contents: [],
      root: '',
      metadata: {},
    } as RecordManifestWithData
  )

  // This is how we keep track of whether the form has been changed.
  const setRecordMetadata = useCallback(
    (x: RecordMetadata) => {
      setChanged(true)
      setRecordMetadataRaw(x)
    },
    [setRecordMetadataRaw]
  )
  const setRecordManifest = useCallback(
    (
      x:
        | RecordManifestWithData
        | ((f: RecordManifestWithData) => RecordManifestWithData)
    ) => {
      setChanged(true)
      setRecordManifestRaw(x)
    },
    [setRecordManifestRaw]
  )

  useLeave(
    navigation,
    changed,
    'Unsaved data',
    'Are you sure you want to leave, unsaved data will be lost',
    () => {}
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
        const formVersion =
          recordResponse?.metadata.formVersion || formMetadata?.version
        const formResponse =
          formUUID &&
          (formVersion
            ? await getFormVersion(formUUID, formVersion)
            : await getForm(formUUID))
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
      setChanged(false)
    }
    fetchData()
  }, [])

  const addPhotoToManifest = useCallback((uri: string) => {
    const fileType = uri.split(',')[0].split(':')[1].split(';')[0]
    if (
      fileType !== 'image/webp' &&
      fileType !== 'image/jpeg' &&
      fileType !== 'image/png'
    )
      throw Error('BUG: Photo must be a webp, jpeg, or png.')
    setRecordManifest(recordManifest =>
      addFileToManifest(
        recordManifest,
        uri,
        (uuid.v4() as string) + '.' + imageExtension(fileType),
        fileType,
        true
      )
    )
  }, [])

  const removePhotoFromManifest = useCallback((sha256: string) => {
    setRecordManifest(recordManifest =>
      removeFileFromManifestSHA256(recordManifest, sha256)
    )
  }, [])

  const onSave = useCallback(
    (record: RecordType, after?: () => any) => {
      const handleSave = async () => {
        try {
          if (!formMetadata) throw Error('Missing form!')
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
              associatedRecords: [],
            }))
          // Update manifest and metadata with the record that we want to save
          const updatedRecordManifest = addOrReplaceRecordTypeInManifest(
            recordManifest,
            record
          )
          await updateRecord(oldRecordMetadata, updatedRecordManifest)
          setChanged(false)
          if (after) after()
        } catch (e) {
          handleStandardErrors(error, warning, success, e)
        } finally {
          setWaiting(null)
        }
      }
      setWaiting('Loading')
      handleSave()
    },
    [formMetadata, recordMetadata, recordManifest]
  )

  const onSaveAndExit = useCallback(
    (record: RecordType) => {
      if (changed) onSave(record, () => navigation.goBack())
      else navigation.goBack()
    },
    [onSave, changed]
  )

  const onUpgrade = useCallback(() => {
    if (!recordMetadata) return
    if (changed)
      error(
        'You cannot upgrade records that have changes. Save the record first.'
      )
    confirmationDialog(
      "Upgrading the record's form",
      'Records keep the form version they were created at. Sometimes, forms can have important changes or fixes you want to use. You can upgrade the record in that case. This should be done rarely and only for a clear reason. If the form is incorrectly changed, this can lead to data loss! After upgrading you must reopen the record.',
      async () => {
        try {
          setWaiting('Upgrading')
          const formResponse = await getForm(recordMetadata.formUUID)
          if (!formResponse) {
            error('Could not upgrade the form')
            setWaiting(null)
            return
          }
          if (formResponse.metadata.version === recordMetadata.formVersion) {
            error('Record is already at latest form version')
            setWaiting(null)
            return
          }
          if (formResponse.metadata.version < recordMetadata.formVersion) {
            error('You cannot downgrade form versions')
            setWaiting(null)
            return
          }
          const newMetadata = {
            ...recordMetadata,
            formVersion: formResponse.metadata.version,
          }
          await updateRecord(newMetadata, recordManifest)
          navigation.goBack()
        } catch (e) {
          error('Failed to upgrade the form version')
        } finally {
          setWaiting(null)
        }
      },
      () => 0
    )
  }, [recordManifest, recordMetadata, changed])

  const onComplete = useCallback(
    (record: RecordType) => {
      const handleComplete = async () => {
        try {
          if (!formMetadata) throw Error('Missing form!')

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
              associatedRecords: [],
            }))

          // Update manifest and metadata with the record that we want to save
          const updatedRecordManifest = addOrReplaceRecordTypeInManifest(
            recordManifest,
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

  const onAddRecord = useCallback(() => {
    false
  }, [])

  const recordMetadataRef = useRef(recordMetadata)
  recordMetadataRef.current = recordMetadata

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
          {formMetadata && formManifest && (!recordMetadata || recordManifest) && (
            <FormMemo
              formMetadata={formMetadata}
              formManifest={formManifest}
              recordMetadataRef={recordMetadataRef}
              setRecordMetadata={setRecordMetadata}
              recordManifest={recordManifest}
              addPhotoToManifest={addPhotoToManifest}
              removePhotoFromManifest={removePhotoFromManifest}
              onExit={() => {
                navigation.goBack()
              }}
              onSaveAndExit={onSaveAndExit}
              onComplete={onComplete}
              onChange={() => setChanged(true)}
              overviewSection={true}
              displayPageAfterOverview={
                'displayPageAfterOverview' in route.params &&
                route.params.displayPageAfterOverview
              }
              onUpgrade={onUpgrade}
              onAddRecord={onAddRecord}
              changed={changed}
            />
          )}
        </VStack>
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
