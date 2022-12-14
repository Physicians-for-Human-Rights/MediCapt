import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  VStack,
  Modal,
  Text,
  Button,
  Box,
  HStack,
  Pressable,
  Center,
} from 'native-base'
import _ from 'lodash'
import Form from 'components/Form'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/provider/navigation'
import { FormManifestWithData, FormMetadata } from 'utils/types/formMetadata'
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
  getRecordMetadata,
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
import { t } from 'i18n-js'
import FormListStaticCompact from 'components/FormListStaticCompact'
import ShareListStatic from 'components/ShareListStatic'
import { goBackMaybeRefreshing } from 'utils/navigation'
import { createShareForRecord, getSharesForRecord } from 'api/provider'
import { Share } from 'utils/types/share'
import UserSearch from 'components/UserSearch'
import { useUserLocations } from 'utils/store'

const FormMemo = React.memo(Form)

export default function RecordEditor({
  route,
  navigation,
}: RootStackScreenProps<'RecordEditor'>) {
  const [changed, setChanged] = useState(false)
  const [waiting, setWaiting] = useState('Loading' as null | string)
  const [error, warning, success] = useInfo()
  const [isAssociatedModalOpen, setIsAssociatedModalOpen] = useState(false)

  const reloadPrevious = useRef(false)

  // Either formMetadata or recordMetadata passed to the RecordEditor as route params
  const [formMetadata, setFormMetadata] = useState(
    'formMetadata' in route.params ? route.params.formMetadata : undefined
  )
  const [recordMetadata, setRecordMetadataRaw] = useState(() =>
    'recordMetadata' in route.params
      ? route.params.recordMetadata
      : {
          'storage-version': '1.0.0',
          formUUID: undefined,
          formID: undefined,
          formVersion: undefined,
          locationID: undefined,
          locationUUID: undefined,
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
          userScopedLocalUUID: uuid.v4() as string,
          isAssociatedRecord: route.params.isAssociatedRecord,
        }
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
  const [associatedForms, setAssociatedForms] = useState([] as FormMetadata[])
  const [associatedRecords, setAssociatedRecords] = useState(
    [] as RecordMetadata[]
  )
  const [shares, setShares] = useState([] as Share[])

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

  // Load the form and record on startup
  useEffect(() => {
    const fetchData = async () => {
      setWaiting('Loading')
      try {
        // Load Record
        const recordResponse =
          'recordUUID' in recordMetadata
            ? await getRecord(recordMetadata.recordUUID)
            : undefined
        if (recordResponse) {
          const contentsWithData = await getRecordManifestContents(
            recordResponse.manifest.contents
          )
          const newRecordMetadata = recordResponse.metadata
          if (!_.isEqual(recordMetadata, recordResponse.metadata))
            setRecordMetadata(newRecordMetadata)
          setRecordManifest({
            'storage-version': '1.0.0',
            root: recordResponse.manifest.root,
            contents: contentsWithData,
          })
          // Load up associated records
          try {
            const l = [] as RecordMetadata[]
            if (newRecordMetadata && newRecordMetadata.associatedRecords) {
              for (const r of newRecordMetadata.associatedRecords || []) {
                const recordResponse = await getRecordMetadata(r.recordUUID)
                if (recordResponse) {
                  l.push(recordResponse)
                }
              }
            }
            setAssociatedRecords(l)
          } catch (e) {
            warning('Failed to load associated records')
          }
          // Look up shares
          try {
            setShares(await getSharesForRecord(newRecordMetadata.recordUUID))
          } catch (e) {
            warning('Failed to load shares')
          }
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
          // Load the associated form metadata
          const l = [] as FormMetadata[]
          if (formResponse.metadata) {
            for (const f of formResponse.metadata.associatedForms || []) {
              const formResponse = await getForm(f.formUUID)
              if (formResponse) {
                l.push(formResponse.metadata)
              }
            }
          }
          setAssociatedForms(l)
        } else {
          throw Error('Missing form')
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
            'recordUUID' in recordMetadata
              ? recordMetadata
              : await createRecord({
                  ...recordMetadata,
                  'storage-version': '1.0.0',
                  formUUID: formMetadata.formUUID,
                  formID: formMetadata.formID,
                  formVersion: formMetadata.version,
                  locationID: formMetadata.locationID,
                  locationUUID: formMetadata.locationUUID,
                })
          // Update manifest and metadata with the record that we want to save
          const updatedRecordManifest = addOrReplaceRecordTypeInManifest(
            recordManifest,
            record
          )
          const newMetadata = await updateRecord(
            oldRecordMetadata,
            updatedRecordManifest
          )
          setRecordMetadata(newMetadata)
          // Add yourself to your parent record, if one exists
          if (
            'addAssociatedRecord' in route.params &&
            route.params.addAssociatedRecord
          )
            route.params.addAssociatedRecord(newMetadata)
          setChanged(false)
          if (after) after()
        } catch (e) {
          handleStandardErrors(error, warning, success, e)
        } finally {
          setWaiting(null)
        }
      }
      setWaiting('Loading')
      reloadPrevious.current = true
      handleSave()
    },
    [formMetadata, recordMetadata, recordManifest]
  )

  const onSaveAndExit = useCallback(
    (record: RecordType) => {
      reloadPrevious.current = true
      if (changed)
        onSave(record, () => {
          goBackMaybeRefreshing(route, navigation, reloadPrevious)
        })
      else goBackMaybeRefreshing(route, navigation, reloadPrevious)
    },
    [onSave, changed]
  )

  const onUpgrade = useCallback(() => {
    if (!recordMetadata || !recordMetadata.formUUID) return
    if (changed)
      error(
        'You cannot upgrade records that have changes. Save the record first.'
      )
    confirmationDialog(
      "Upgrading the record's form",
      'Records keep the form version they were created at. Sometimes, forms can have important changes or fixes you want to use. You can upgrade the record in that case. This should be done rarely and only for a clear reason. If the form is incorrectly changed, this can lead to data loss! After upgrading you must reopen the record.',
      async () => {
        try {
          reloadPrevious.current = true
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
          goBackMaybeRefreshing(route, navigation, reloadPrevious)
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
          // Seal updated record
          reloadPrevious.current = true
          setRecordMetadata(await sealRecord(recordMetadata))
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
    setIsAssociatedModalOpen(true)
  }, [])

  // TODO This is a temporary hack until we upgrade everything to include
  // locationIDs and locationUUIDs
  const locations = useUserLocations()
  const onShareRecord = useCallback(() => {
    recordMetadata &&
      formMetadata &&
      'recordUUID' in recordMetadata &&
      navigation.navigate('FindUser', {
        ...route.params,
        selectUser: async u => {
          try {
            setWaiting('Creating share')
            const expirationDate = new Date()
            expirationDate.setFullYear(expirationDate.getFullYear() + 2)
            const l = _.find(locations, l =>
              _.isString(l)
                ? l === formMetadata.locationID
                : l.locationID === formMetadata.locationID
            )
            await createShareForRecord({
              'storage-version': '1.0.0',
              recordUUID: recordMetadata.recordUUID,
              recordID: recordMetadata.recordID,
              recordCreatedDate: recordMetadata.createdDate,
              recordCreatedByUUID: recordMetadata.createdByUUID,
              locationUUID: _.isString(l) ? l : l!.locationUUID,
              locationID: formMetadata.locationID,
              //
              formUUID: recordMetadata.formUUID,
              formID: recordMetadata.formID,
              formVersion: recordMetadata.formVersion,
              formTitle: formMetadata.title,
              formSubtitle: formMetadata.subtitle,
              formTags: formMetadata.tags,
              formOfficialName: formMetadata['official-name'],
              formOfficialCode: formMetadata['official-code'],
              //
              sharedWithUUID: u.userUUID,
              sharedWithUUIDUserType: u.userType,
              shareExpiresOn: expirationDate,
              //
              patientName: recordMetadata.patientName,
              patientGender: recordMetadata.patientGender,
              patientAddress: recordMetadata.patientAddress,
              patientDateOfBirth: recordMetadata.patientDateOfBirth,
              patientPhoneNumber: recordMetadata.patientPhoneNumber,
              patientEmail: recordMetadata.patientEmail,
              incidentDate: recordMetadata.incidentDate,
              caseId: recordMetadata.caseId,
            })
            setShares(await getSharesForRecord(recordMetadata.recordUUID))
          } catch (e) {
            handleStandardErrors(error, warning, success, e)
          } finally {
            setWaiting(null)
          }
        },
        defaultLocationUUID: recordMetadata.locationUUID,
      })
  }, [recordMetadata, formMetadata])

  const onPrintRecord = useCallback(() => {
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
      route={route}
      reloadPrevious={reloadPrevious}
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
                goBackMaybeRefreshing(route, navigation, reloadPrevious)
              }}
              onSave={onSave}
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
              onShareRecord={onShareRecord}
              onPrint={onPrintRecord}
              changed={changed}
              associatedRecords={associatedRecords}
              selectAssociatedRecord={r => {
                const { formMetadata, ...newParams } = route.params
                navigation.push('RecordEditor', {
                  ...newParams,
                  recordMetadata: r,
                })
              }}
              shares={shares}
              selectShare={console.log}
              reloadPrevious={reloadPrevious}
            />
          )}
        </VStack>
        <Modal
          isOpen={isAssociatedModalOpen}
          onClose={() => setIsAssociatedModalOpen(false)}
          size="lg"
        >
          <Modal.Content>
            <Modal.CloseButton />
            <Modal.Header>
              {t('record.overview.select-associated-record-to-add')}
            </Modal.Header>
            <Modal.Body>
              <FormListStaticCompact
                forms={associatedForms}
                selectItem={e => {
                  setIsAssociatedModalOpen(false)
                  const { recordMetadata, ...newParams } = route.params
                  navigation.push('RecordEditor', {
                    ...newParams,
                    formMetadata: e,
                    displayPageAfterOverview: true,
                    isAssociatedRecord: true,
                    addAssociatedRecord: async r => {
                      const newMetadata: RecordMetadata = {
                        ...recordMetadataRef.current,
                        associatedRecords: _.concat(
                          recordMetadataRef.current.associatedRecords,
                          [
                            {
                              recordUUID: r.recordUUID,
                              recordID: r.recordID,
                            },
                          ]
                        ),
                      }
                      reloadPrevious.current = true
                      setRecordMetadata(
                        await updateRecord(newMetadata, recordManifest)
                      )
                      setAssociatedRecords(l => _.concat(l, [r]))
                    },
                  })
                }}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button
                  variant="ghost"
                  colorScheme="blueGray"
                  onPress={() => setIsAssociatedModalOpen(false)}
                >
                  Cancel
                </Button>
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
