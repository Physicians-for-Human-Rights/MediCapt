import React, { useState, useEffect, useCallback } from 'react'
import { VStack } from 'native-base'
import _ from 'lodash'
import Form from 'components/Form'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/provider/navigation'
import {
  getRecord,
  getForm,
  createRecord,
  commitRecord,
  updateRecord,
  sealRecord,
} from 'api/provider'
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
import {
  addOrReplaceFileToManifestByFilename,
  makeManifestEntry,
  fetchManifestContents,
} from 'utils/manifests'
import Loading from 'components/Loading'
import { RecordType } from 'utils/types/record'
import {
  RecordMetadata,
  recordManifestSchema,
  RecordManifestWithData,
  RecordManifest,
} from 'utils/types/recordMetadata'
import { standardHandler } from 'api/utils'
import { useInfo } from 'utils/errors'
import { dataURItoBlob } from 'utils/data'
import {
  sha256,
  md5,
  lookupManifestSHA256,
  filetypeIsDataURI,
} from 'utils/manifests'

const FormMemo = React.memo(Form)

const defaultRecordMetadata: Partial<RecordMetadata> = {
  'storage-version': '1.0.0',
  formUUID: undefined,
  formID: undefined,
  formVersion: undefined,
  locationID: undefined,
  patientName: '',
  patientGender: '',
  patientAge: '',
  caseId: '',
  manifestHash: '',
  manifestMD5: '',
  recordUUID: undefined,
  recordID: undefined,
  patientUUID: undefined,
  patientID: undefined,
  createdDate: undefined,
  createdByUUID: undefined,
  lastChangedDate: undefined,
  lastChangedByUUID: undefined,
  version: undefined,
  sealed: false,
}

const defaultRecordManifest: Partial<RecordManifest> = {
  'storage-version': '1.0.0',
  contents: [],
  root: '',
}

export default function RecordEditor({
  route,
  navigation,
}: RootStackScreenProps<'RecordEditor'>) {
  const [changed, setChanged] = useState(false)
  const [waiting, setWaiting] = useState(null as null | string)

  const [error, warning, success] = useInfo()
  const standardReporters = { setWaiting, error, warning, success }

  // Handle the input record if we have one
  const [recordMetadata, setRecordMetadataRaw] = useState(
    ((route.params && 'recordMetadata' in route.params) ||
      defaultRecordMetadata) as Partial<RecordMetadata>
  )
  const [recordManifest, setRecordManifestRaw] = React.useState(
    defaultRecordManifest as RecordManifestWithData
  )

  // The input record overrides any form information that may have been provided.
  const [formMetadata, setFormMetadata] = useState(
    (recordMetadata.formID
      ? null
      : (route.params && 'formMetadata' in route.params) ||
        null) as FormMetadata | null
  )
  const [formManifest, setFormManifest] = React.useState(
    {} as FormManifestWithData
  )

  // This is how we keep track of whether the record has been changed.
  const setRecordMetadata = useCallback(
    x => {
      setChanged(true)
      setRecordMetadataRaw(x)
    },
    [setRecordMetadataRaw]
  )
  const setRecordManifest = useCallback(
    x => {
      setChanged(true)
      setRecordManifestRaw(x)
    },
    [setRecordManifestRaw]
  )

  // Load record and associated form on startup
  useEffect(() => {
    const fn = async () => {
      let recordResponse
      if (route.params && 'recordMetadata' in route.params) {
        setWaiting('Loading record')
        recordResponse = await getRecord(route.params.recordMetadata.recordUUID)
        setRecordMetadata(recordResponse.metadata)
        const contents = await fetchManifestContents(
          recordResponse.manifest.contents
        )
        setRecordManifest({
          'storage-version': '1.0.0',
          root: recordResponse.manifest.root,
          contents,
        })
        setWaiting(null)
        setChanged(false)
      }
      const formUUID =
        (recordResponse &&
          recordResponse.metadata &&
          recordResponse.metadata.formUUID) ||
        (route.params &&
          'formMetadata' in route.params &&
          route.params.formMetadata.formUUID)
      if (formUUID) {
        setWaiting('Loading form')
        const formResponse = await getForm(formUUID)
        setFormMetadata(formResponse.metadata)
        const contents = await fetchManifestContents(
          formResponse.manifest.contents
        )
        setFormManifest({
          'storage-version': '1.0.0',
          root: formResponse.manifest.root,
          contents,
        })
        setWaiting(null)
        setChanged(false)
      } else {
        console.log('TODO Missing form!')
      }
    }
    fn()
  }, [])

  const handleCreateRecord = async () =>
    await standardHandler(
      standardReporters,
      'Creating record',
      '',
      async () => {
        if (!formMetadata) {
          error('BUG: Form is missing')
          return
        }
        const recordRequest: Partial<RecordMetadata> = {
          ...recordMetadata,
          formUUID: formMetadata.formUUID,
          formID: formMetadata.formID,
          formVersion: formMetadata.version,
          locationID: formMetadata.locationID,
        }
        const newMetadata = await createRecord(
          //@ts-ignore We validate this before the call
          recordRequest
        )
        setRecordMetadata(newMetadata)
        setChanged(false)
        return newMetadata
      }
    )

  const submitRecord = async (
    updatedMetadata: Partial<RecordMetadata>,
    updatedManifest: RecordManifestWithData
  ) =>
    await standardHandler(
      standardReporters,
      'Uploading record',
      'Record synchronized',
      async () => {
        // Make sure we don't upload anything other than
        // the minimal manifest by stripping our
        // manifest.
        let manifestData = JSON.stringify(
          recordManifestSchema.strip().parse(updatedManifest)
        )
        const remoteMetadata = {
          ...updatedMetadata,
          manifestHash: sha256(manifestData),
          manifestMD5: md5(manifestData),
        }
        const { metadata: newMetadata, manifest: newManifest } =
          await updateRecord(
            // @ts-ignore We validate this before the call
            remoteMetadata,
            updatedManifest
          )
        // Upload the parts
        for (const e of newManifest.contents) {
          let record = new FormData()
          for (const field in e.link.fields) {
            record.append(field, e.link.fields[field])
          }
          const blob =
            e.filename === 'manifest' && e.filetype === 'manifest'
              ? new Blob([manifestData], {
                  type: 'text/plain',
                })
              : filetypeIsDataURI(e.filetype)
              ? dataURItoBlob(
                  lookupManifestSHA256(updatedManifest, e.sha256)!.data
                )
              : new Blob(
                  [lookupManifestSHA256(updatedManifest, e.sha256)!.data],
                  {
                    type: e.filetype,
                  }
                )
          record.append('file', blob)
          try {
            await fetch(e.link.url, {
              method: 'POST',
              headers: {},
              body: record,
            })
          } catch (err) {
            console.error('Failed to upload', e, err)
          }
        }
        // Upload is finished, commit
        setRecordMetadata(
          await commitRecord(
            updatedMetadata.recordUUID!,
            // @ts-ignore our partial type is verified in the call
            remoteMetadata
          )
        )
        setChanged(false)
      }
    )

  const handleSubmitAndSave = async () => {
    let newMedata = recordMetadata
    if (!recordMetadata.recordUUID) {
      const r = await handleCreateRecord()
      if (r) newMedata = r
      // NB we showed an error elsewhere
      else return
    }
    await submitRecord(newMedata, recordManifest)
    setChanged(false)
  }

  const handleSaveAndExit = async () => {
    await handleSubmitAndSave()
    navigation.goBack()
  }

  const handleSealRecord = () => {
    if (changed) {
      error('Save the record before trying to seal it')
      return
    }
    if (recordMetadata.recordUUID)
      setRecordMetadata(sealRecord(recordMetadata.recordUUID))
    else error('Save the record before trying to seal it')
  }

  const setRecord = useCallback(
    (record: RecordType) => {
      setChanged(true)
      const recordData = JSON.stringify(record)
      const entry = makeManifestEntry(
        recordData,
        'record.json',
        'text/json',
        false
      )
      setRecordManifest({
        ...addOrReplaceFileToManifestByFilename(
          recordManifest,
          recordData,
          'record.json',
          'text/json',
          false
        ),
        root: entry.sha256,
      })
    },
    [recordManifest]
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
          {formMetadata && formManifest && recordMetadata && recordManifest && (
            <FormMemo
              formMetadata={formMetadata}
              formManifest={formManifest}
              recordMetadata={recordMetadata}
              recordManifest={recordManifest}
              setRecord={setRecord}
              onCancel={() => navigation.goBack()}
              onSaveAndExit={handleSaveAndExit}
              onComplete={() => null}
            />
          )}
        </VStack>
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
