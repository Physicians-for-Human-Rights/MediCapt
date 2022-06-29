import React, { useState, useCallback, useEffect } from 'react'
import useMap from 'react-use/lib/useMap'
import usePrevious from 'react-use/lib/usePrevious'
import useSet from 'react-use/lib/useSet'
import useToggle from 'react-use/lib/useToggle'
import {
  Keyboard,
  // NB Don't use the native-base FlatList. It's buggy!
} from 'react-native'
import _ from 'lodash'
import { ZodError } from 'zod'
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import { t } from 'i18n-js'
import { View, useBreakpointValue } from 'native-base'
import FormMenu from 'components/FormMenu'
import FromTop from 'components/FormTop'
import {
  RecordValue,
  RecordValuePath,
  recordValueSchema,
  RecordType,
  FlatRecord,
} from 'utils/types/record'
import { allFormRenderCommands } from 'utils/formRendering/commands'
import { renderCommand } from 'utils/formRendering/renderer'
import { transformToLayout } from 'utils/formRendering/transformations'
import { nameFormSections, isSectionComplete } from 'utils/forms'
import { recordTypeToFlatRecord, flatRecordToRecordType } from 'utils/records'
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
import {
  RecordMetadata,
  RecordManifestWithData,
} from 'utils/types/recordMetadata'
import {
  getFormTypeFromManifest,
  getRecordTypeFormManifest,
} from 'utils/manifests'
import { RenderCommand } from 'utils/formRendering/types'
import formatDate from 'utils/date.ts'
import { getUserByUUIDCached } from 'api/common'
import { userFullName } from 'utils/userTypes'
import { UserType } from 'utils/types/user'
import FormButtons from 'components/FormButtons'

// FIXME Temproary hack before rewriting Form to invert control back to
// RecordEditor and show error messages
function getRecordFromManifest(
  recordManifest: RecordManifestWithData | undefined
): FlatRecord {
  if (!recordManifest) return {}
  const r = getRecordTypeFormManifest(recordManifest)
  if (!r || r instanceof ZodError) {
    console.log(r, 'FIXME OLD STYLE RECORD')
    return {}
  }
  return recordTypeToFlatRecord(r)
}

function mkTitle(title: string, key: string) {
  return [
    {
      type: 'title',
      title,
      size: 'md',
      valuePath: [],
      key: key + 1,
      disable: false,
      recordValue: { type: 'text', value: '' },
      recordSummary: undefined,
    },
  ]
}

function mkText(title: string, text: string, key: string) {
  return [
    {
      type: 'title',
      title,
      size: 'sm',
      valuePath: [],
      key: key + 1,
      disable: false,
      recordValue: { type: 'text', value: '' },
      recordSummary: undefined,
    },
    {
      type: 'text',
      valuePath: [],
      key: key + 2,
      disable: true,
      recordValue: { type: 'text', value: text },
      recordSummary: undefined,
    },
    {
      type: 'divider',
      thickness: 1,
      valuePath: [],
      key: key + 3,
      disable: false,
    },
  ]
}

function mkLongText(
  title: string,
  text: string,
  key: string,
  longLines: number
) {
  return [
    {
      type: 'row-with-description',
      left: {
        type: 'title',
        title,
        size: 'sm',
        valuePath: [],
        key: key + 1,
        disable: false,
        recordValue: { type: 'text', value: '' },
        recordSummary: undefined,
      },
      right: {
        type: 'title',
        title: '',
        size: 'sm',
        valuePath: [],
        key: key + 2,
        disable: false,
        recordValue: { type: 'text', value: '' },
        recordSummary: undefined,
      },
      description: {
        type: 'long-text',
        valuePath: [],
        key: key + 3,
        disable: true,
        recordValue: { type: 'text', value: text },
        recordSummary: undefined,
        numberOfLines: longLines,
      },
    },
    {
      type: 'divider',
      thickness: 1,
      valuePath: [],
      key: key + 4,
      disable: false,
    },
  ]
}

export default function Form({
  formMetadata,
  formManifest,
  recordMetadataRef = { current: undefined },
  setRecordMetadata = () => null,
  recordManifest,
  addPhotoToManifest = () => null,
  removePhotoFromManifest = () => null,
  onCancel,
  onSaveAndExit,
  onComplete,
  disableMenu = false,
  onChange = () => null,
  overrideTransformation = undefined,
  overviewSection = false,
  displayPageAfterOverview = false,
}: {
  formMetadata: FormMetadata
  formManifest: FormManifestWithData
  recordMetadataRef?: React.MutableRefObject<RecordMetadata | undefined>
  setRecordMetadata?: (r: RecordMetadata) => void
  recordManifest?: RecordManifestWithData
  addPhotoToManifest?: (uri: string) => any
  removePhotoFromManifest?: (sha256: string) => any
  noRenderCache?: boolean
  onCancel: () => any
  onSaveAndExit: (record: RecordType) => any
  onComplete: (record: RecordType) => any
  disableMenu?: boolean
  onChange?: () => any
  overrideTransformation?: 'phone' | 'compact' | 'large'
  overviewSection?: boolean
  displayPageAfterOverview?: boolean
}) {
  const [flatRecord, { set: setFlatRecordValue }] = useMap(
    getRecordFromManifest(recordManifest)
  )

  const form = getFormTypeFromManifest(formManifest)

  const formSections = _.concat(
    overviewSection
      ? [
          {
            name: 'Record Overview',
            title: t('record.overview.section-title'),
            parts: [],
          },
        ]
      : [],
    nameFormSections(form.sections)
  )

  const [keepAlive, { add: addKeepAlive, remove: removeKeepAlive }] = useSet(
    new Set([] as string[])
  )

  const [currentSection, setCurrentSection] = useState(
    overviewSection && displayPageAfterOverview ? 1 : 0
  )
  const setSection = useCallback(
    (i: number) => setCurrentSection(i),
    [setCurrentSection]
  )
  const setSectionOffset = useCallback(
    (offset: number) => setCurrentSection(currentSection + offset),
    [setCurrentSection, currentSection]
  )

  // The side menu, although depending on the size of the viewport
  // we sometimes display it on top
  const [isMenuVisible, rawToggleMenuVisible] = useToggle(false)
  const toggleMenuVisible = useCallback(() => {
    // Users are very likely to be editing a field
    Keyboard.dismiss()
    rawToggleMenuVisible()
  }, [rawToggleMenuVisible])

  const isSectionCompleteList = form
    ? _.map(formSections, section =>
        isSectionComplete(section, form.common, flatRecord)
      )
    : []

  const onSaveAndExitRecord = useCallback(
    () => onSaveAndExit(flatRecordToRecordType(flatRecord)),
    [onSaveAndExit, flatRecord]
  )

  const onCompleteRecord = useCallback(
    () => onComplete(flatRecordToRecordType(flatRecord)),
    [onComplete, flatRecord]
  )

  const layoutType =
    overrideTransformation ||
    (useBreakpointValue({
      base: 'phone',
      md: 'compact',
      lg: 'large',
    }) as 'phone' | 'compact' | 'large')

  const [users, setUsers] = useState({} as Record<string, Partial<UserType>>)

  useEffect(() => {
    async function usersFn() {
      if (!recordMetadataRef.current) return
      const loadedUsers = {} as Record<string, Partial<UserType>>
      await Promise.all(
        _.map(
          [
            recordMetadataRef.current.createdByUUID,
            recordMetadataRef.current.lastChangedByUUID,
          ],
          async userUUID => {
            if (!userUUID) return
            const result = await getUserByUUIDCached(
              'Provider',
              userUUID,
              () => null
            )
            if (result) loadedUsers[userUUID] = result
            return result
          }
        )
      )
      setUsers(loadedUsers)
    }
    usersFn()
  }, [recordMetadataRef])

  const renderCommands =
    !_.isEmpty(formSections) && form && 'common' in form
      ? transformToLayout(
          // @ts-ignore
          overviewSection && currentSection === 0
            ? // @ts-ignore
              _.concat(
                // @ts-ignore
                mkTitle(t('record.overview.titles.patient'), 'ptitle'),
                // @ts-ignore
                [
                  {
                    type: 'description',
                    // @ts-ignore TODO
                    description: t('record.overview.automatically-filled'),
                    key: 'D',
                    valuePath: [],
                    disable: false,
                  },
                ],
                mkText(
                  t('heading.name'),
                  recordMetadataRef.current &&
                    recordMetadataRef.current.patientName
                    ? recordMetadataRef.current.patientName
                    : 'N/A',
                  'pname'
                ),
                mkText(
                  t('user.gender'),
                  recordMetadataRef.current &&
                    recordMetadataRef.current.patientGender
                    ? t('gender.' + recordMetadataRef.current.patientGender)
                    : 'N/A',
                  'pgender'
                ),
                mkLongText(
                  t('user.address'),
                  recordMetadataRef.current &&
                    recordMetadataRef.current.patientAddress
                    ? recordMetadataRef.current.patientAddress
                    : 'N/A',
                  'paddress',
                  2
                ),
                mkText(
                  t('user.date-of-birth'),
                  recordMetadataRef.current &&
                    recordMetadataRef.current.patientDateOfBirth >
                      new Date('January 01 1500')
                    ? formatDate(
                        recordMetadataRef.current.patientDateOfBirth,
                        'PPP'
                      )
                    : 'N/A',
                  'pdob'
                ),
                mkText(
                  t('user.phone-number'),
                  recordMetadataRef.current &&
                    recordMetadataRef.current.patientPhoneNumber
                    ? recordMetadataRef.current.patientPhoneNumber
                    : 'N/A',
                  'pnumber'
                ),
                mkText(
                  t('user.email'),
                  recordMetadataRef.current &&
                    recordMetadataRef.current.patientEmail
                    ? recordMetadataRef.current.patientEmail
                    : 'N/A',
                  'pemail'
                ),
                mkText(
                  t('record.incident-date'),
                  recordMetadataRef.current &&
                    recordMetadataRef.current.incidentDate >
                      new Date('January 01 1500')
                    ? formatDate(recordMetadataRef.current.incidentDate, 'PPP')
                    : 'N/A',
                  'pincidentdate'
                ),
                mkTitle(t('record.overview.titles.administrative'), 'atitle'),
                mkText(
                  t('record.overview.record-id'),
                  recordMetadataRef.current
                    ? recordMetadataRef.current.recordID
                    : 'Automatic',
                  'recordID'
                ),
                mkText(
                  t('record.overview.case-id'),
                  recordMetadataRef.current && recordMetadataRef.current.caseId
                    ? recordMetadataRef.current.caseId
                    : 'N/A',
                  'caseID'
                ),
                mkText(
                  t('record.overview.form-title'),
                  formMetadata.title,
                  'formTitle'
                ),
                mkText(
                  t('record.overview.form-id'),
                  formMetadata.formID,
                  'formID'
                ),
                mkText(
                  t('record.overview.form-version'),
                  formMetadata.version,
                  'formVersion'
                ),
                mkText(
                  t('record.overview.form-name-and-code'),
                  formMetadata['official-name'] +
                    '-' +
                    formMetadata['official-code'],
                  'formCode'
                ),
                mkTitle(t('record.overview.titles.timeline'), 'ttitle'),
                mkText(
                  t('record.overview.record-version'),
                  recordMetadataRef.current
                    ? recordMetadataRef.current.version
                    : 'Automatic',
                  'recordVersion'
                ),
                mkText(
                  t('record.overview.created-date'),
                  recordMetadataRef.current &&
                    recordMetadataRef.current.createdDate >
                      new Date('January 01 1500')
                    ? formatDate(recordMetadataRef.current.createdDate, 'PPP')
                    : 'N/A',
                  'cdate'
                ),
                mkText(
                  t('record.overview.created-by'),
                  recordMetadataRef.current &&
                    recordMetadataRef.current.createdByUUID
                    ? userFullName(
                        users[recordMetadataRef.current.createdByUUID],
                        recordMetadataRef.current.createdByUUID
                      )
                    : 'N/A',
                  'cby'
                ),
                mkText(
                  t('record.overview.last-changed-date'),
                  recordMetadataRef.current &&
                    recordMetadataRef.current.lastChangedDate >
                      new Date('January 01 1500')
                    ? formatDate(
                        recordMetadataRef.current.lastChangedDate,
                        'PPP'
                      )
                    : 'N/A',
                  'ldate'
                ),
                mkText(
                  t('record.overview.last-changed-by'),
                  recordMetadataRef.current &&
                    recordMetadataRef.current.lastChangedByUUID
                    ? userFullName(
                        users[recordMetadataRef.current.lastChangedByUUID],
                        recordMetadataRef.current.lastChangedByUUID
                      )
                    : 'N/A',
                  'lby'
                )
              )
            : allFormRenderCommands(
                formSections[currentSection],
                form.common,
                _.concat(
                  formManifest.contents || [],
                  recordManifest?.contents || []
                ),
                flatRecord
              ),
          layoutType
        )
      : []

  const setRecordPath = useCallback(
    (path: RecordValuePath, value: RecordValue) => {
      const r = recordValueSchema.safeParse(value)
      console.trace('Failed parse', r, value)
      setFlatRecordValue(
        _.join(path, '.'),
        // @ts-ignore TODO What is a good default here?
        r.success ? r.data : ''
      )
    },
    [setFlatRecordValue]
  )
  const renderItem = useCallback(
    ({ item }) =>
      renderCommand(
        item,
        setRecordPath,
        recordMetadataRef,
        setRecordMetadata,
        addPhotoToManifest,
        removePhotoFromManifest,
        addKeepAlive,
        removeKeepAlive
      ),
    [
      setRecordPath,
      addPhotoToManifest,
      removePhotoFromManifest,
      addKeepAlive,
      removeKeepAlive,
      recordMetadataRef,
      setRecordMetadata,
    ]
  )

  // Calculate changed paths, and if there are any,
  // call setRecord with the new record
  const previousFlatRecord = usePrevious(flatRecord)
  const changedPaths = _.reduce(
    _.union(_.keys(flatRecord), _.keys(previousFlatRecord)),
    (changedPaths: string[], key) => {
      if (
        previousFlatRecord &&
        !_.isEqual(flatRecord[key], previousFlatRecord[key])
      ) {
        return changedPaths.concat(key)
      }
      return changedPaths
    },
    []
  )

  useEffect(() => {
    if (!_.isEmpty(changedPaths)) onChange()
  }, [changedPaths])

  if (!_.isEmpty(changedPaths)) {
    const record = flatRecordToRecordType(flatRecord)
    // TODO Remove after testing
    if (!_.isEqual(flatRecord, recordTypeToFlatRecord(record))) {
      console.log('RM', recordManifest)
      console.log('FR', flatRecord)
      console.log('R', record)
      console.error(
        'recordTypeToFlatRecord(record) is not the same as flatRecord!'
      )
    }
  }

  // This can happen when editing forms live
  if (form === undefined) return null

  return (
    <View flex={1}>
      <FromTop
        key="form-top"
        sectionOffset={setSectionOffset}
        currentSection={currentSection}
        toggleMenu={toggleMenuVisible}
        title={
          formSections[currentSection] ? formSections[currentSection].title : ''
        }
        lastSection={formSections.length - 1}
        isSectionCompleted={isSectionCompleteList[currentSection]}
        isMenuVisible={isMenuVisible}
      />
      {isMenuVisible && !disableMenu ? (
        <FormMenu
          formSections={formSections}
          changeSection={setSection}
          toggleMenu={toggleMenuVisible}
          isSectionCompleteList={isSectionCompleteList}
          onCancel={onCancel}
          onSaveAndExit={onSaveAndExitRecord}
          onCompleteRecord={onCancel}
          onPrint={onCancel}
        />
      ) : (
        <KeyboardAwareFlatList
          style={style}
          data={renderCommands}
          renderItem={renderItem}
          initialNumToRender={10}
          windowSize={25}
          keyboardDismissMode="none"
          removeClippedSubviews={false}
          ListHeaderComponent={
            currentSection === 0 && overviewSection ? (
              <FormButtons
                isSectionCompleteList={isSectionCompleteList}
                onCancel={onCancel}
                onSaveAndExit={onSaveAndExitRecord}
                onCompleteRecord={onCancel}
                onPrint={onCancel}
              />
            ) : (
              <></>
            )
          }
        />
      )}
    </View>
  )
}

const style = { height: 800, backgroundColor: '#fff', padding: 10 }
