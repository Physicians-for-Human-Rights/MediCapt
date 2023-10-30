import React, { useState, useEffect, useCallback, useRef } from 'react'
import _ from 'lodash'
import Form from 'components/Form'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/associate/navigation'
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
import { Share } from 'utils/types/share'
import UserSearch from 'components/UserSearch'
import { useUserLocations } from 'utils/store'
import { getRecordShare } from 'api/associate'
import { SafeAreaView, Dimensions } from 'react-native'
import styles, { layout } from '../../components/styles'
import { breakpoints } from '../../components/nativeBaseSpec'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md
const FormMemo = React.memo(Form)

export default function ShareViewer({
  route,
  navigation,
}: RootStackScreenProps<'ShareViewer'>) {
  const [waiting, setWaiting] = useState('Loading' as null | string)
  const [error, warning, success] = useInfo()

  const [share, setShare] = useState(route.params.share as Share)

  // Either formMetadata or recordMetadata passed to the RecordEditor as route params
  const [formMetadata, setFormMetadata] = useState(
    undefined as FormMetadata | undefined
  )
  const [recordMetadata, setRecordMetadata] = useState(
    undefined as RecordMetadata | undefined
  )
  const [formManifest, setFormManifest] = useState(
    undefined as FormManifestWithData | undefined
  )
  const [recordManifest, setRecordManifest] = useState(
    undefined as RecordManifestWithData | undefined
  )

  // TODO
  const [associatedForms, setAssociatedForms] = useState([] as FormMetadata[])
  const [associatedRecords, setAssociatedRecords] = useState(
    [] as RecordMetadata[]
  )

  // Load the form and record on startup
  useEffect(() => {
    const fetchData = async () => {
      setWaiting('Loading')
      try {
        // Load Record
        const r = await getRecordShare(share.shareUUID)
        setRecordMetadata(r.record.metadata)
        const recordContentsWithData = await getRecordManifestContents(
          r.record.manifest.contents
        )
        setRecordManifest({
          'storage-version': '1.0.0',
          root: r.record.manifest.root,
          contents: recordContentsWithData,
        })
        setFormMetadata(r.form.metadata)
        const formContentsWithData = await getFormManifestContents(
          r.form.manifest.contents
        )
        setFormManifest({
          'storage-version': '1.0.0',
          root: r.form.manifest.root,
          contents: formContentsWithData,
        })

        // TODO
        // Load up associated records
        // try {
        //   const l = [] as RecordMetadata[]
        //   if (newRecordMetadata && newRecordMetadata.associatedRecords) {
        //     for (const r of newRecordMetadata.associatedRecords || []) {
        //       const recordResponse = await getRecordMetadata(r.recordUUID)
        //       if (recordResponse) {
        //         l.push(recordResponse)
        //       }
        //     }
        //   }
        //   setAssociatedRecords(l)
        // } catch (e) {
        //   warning('Failed to load associated records')
        // }
        // The input record overrides any form information that may have been provided.

        // TODO
        // Load the associated form metadata
        // const l = [] as FormMetadata[]
        // if (formResponse.metadata) {
        //   for (const f of formResponse.metadata.associatedForms || []) {
        //     const formResponse = await getForm(f.formUUID)
        //     if (formResponse) {
        //       l.push(formResponse.metadata)
        //     }
        //   }
      } catch (e) {
        handleStandardErrors(error, warning, success, e)
      } finally {
        setWaiting(null)
      }
    }
    fetchData()
  }, [])

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
    >
      <>
        <SafeAreaView
          style={[
            styles.formDesignerView,
            layout.flex1,
            { borderRadius: isWider ? 8 : 0, paddingHorizontal: 0 },
          ]}
        >
          {formMetadata && formManifest && (!recordMetadata || recordManifest) && (
            <FormMemo
              formMetadata={formMetadata}
              formManifest={formManifest}
              recordMetadataRef={recordMetadataRef}
              setRecordMetadata={setRecordMetadata}
              recordManifest={recordManifest}
              onExit={() => {
                navigation.goBack()
              }}
              overviewSection={true}
              displayPageAfterOverview={false}
              onPrint={onPrintRecord}
              associatedRecords={associatedRecords}
              selectAssociatedRecord={r => null}
              readOnly={true}
            />
          )}
        </SafeAreaView>
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
