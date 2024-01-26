import React, { useState, useCallback, useEffect } from 'react'
import useMap from 'react-use/lib/useMap'
import usePrevious from 'react-use/lib/usePrevious'
import useSet from 'react-use/lib/useSet'
import useToggle from 'react-use/lib/useToggle'
import { Keyboard, View } from 'react-native'
import _ from 'lodash'
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import { useStoreState } from '../utils/store'
import { useBreakpointValue } from '../hooks/useBreakpointValue'
import FormMenu from 'components/FormMenu'
import FromTop from 'components/FormTop'
import {
  RecordValue,
  RecordValuePath,
  recordValueSchema,
  RecordType,
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
// import { getFormTypeFromManifest } from 'utils/manifests'
import { getUserByUUIDCached } from 'api/common'
import { UserType } from 'utils/types/user'
import FormButtons from 'components/FormButtons'

import { RenderCommand } from 'utils/formRendering/types'
import confirmationDialog from 'utils/confirmationDialog'
import { Share } from 'utils/types/share'
import { disableRenderCommands } from 'utils/formRendering/utils'
import { layout } from './styles'
import recordOverviewPage from './RecordOverViewPage'
import getRecordFromManifest from './getRecordFromManifest'
import { formX } from '../mockData/form_x'

// FIXME Temproary hack before rewriting Form to invert control back to
// RecordEditor and show error messages

interface IProps {
  formMetadata: FormMetadata
  formManifest: FormManifestWithData
  recordMetadataRef?: React.MutableRefObject<RecordMetadata | undefined>
  setRecordMetadata?: (r: RecordMetadata) => void
  recordManifest?: RecordManifestWithData
  addPhotoToManifest?: (uri: string) => any
  removePhotoFromManifest?: (sha256: string) => any
  noRenderCache?: boolean
  onExit: () => any
  onSaveAndExit: (record: RecordType) => any
  onSave: (record: RecordType) => any
  onComplete: (record: RecordType) => any
  disableMenu?: boolean
  onChange?: () => any
  overrideTransformation?: 'phone' | 'compact' | 'large'
  overviewSection?: boolean
  displayPageAfterOverview?: boolean
  onUpgrade?: () => any
  onAddRecord?: () => any
  onShareRecord?: () => any
  onPrint?: () => any
  changed: boolean
  associatedRecords?: RecordMetadata[]
  selectAssociatedRecord?: (r: RecordMetadata) => any
  shares?: Share[]
  selectShare?: (r: Share) => any
  reloadPrevious: React.MutableRefObject<boolean>
  readOnly?: boolean
}

export default function Form({
  formMetadata,
  formManifest,
  recordMetadataRef = { current: undefined },
  setRecordMetadata = () => null,
  recordManifest,
  addPhotoToManifest = () => null,
  removePhotoFromManifest = () => null,
  onExit,
  onSaveAndExit,
  onSave,
  onComplete,
  disableMenu = false,
  onChange = () => null,
  overrideTransformation = undefined,
  overviewSection = false,
  displayPageAfterOverview = false,
  onUpgrade,
  onAddRecord,
  onShareRecord,
  onPrint,
  changed,
  associatedRecords = [],
  selectAssociatedRecord = () => null,
  shares = [],
  selectShare = () => null,
  reloadPrevious,
  readOnly = false,
}: IProps) {
  const state = useStoreState()
  const i18n = state?.i18n
  const isSealed =
    (recordMetadataRef.current && recordMetadataRef.current.sealed) || false
  const [flatRecord, { set: setFlatRecordValue }] = useMap(() =>
    getRecordFromManifest(recordManifest)
  )

  // const form = getFormTypeFromManifest(formManifest)
  const form = formX
  const formSections = _.concat(
    overviewSection
      ? [
          {
            name: i18n.t('record.overview.record-overview'),
            title: i18n.t('record.overview.section-title'),
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

  const onSaveAndExitRecord = useCallback(() => {
    onSaveAndExit(flatRecordToRecordType(flatRecord))
    reloadPrevious.current = true
  }, [onSaveAndExit, flatRecord])

  const onSaveRecord = useCallback(() => {
    onSave(flatRecordToRecordType(flatRecord))
    reloadPrevious.current = true
  }, [onSaveAndExit, flatRecord])

  const onCompleteRecord = useCallback(() => {
    confirmationDialog(
      'Sealing records',
      _.every(isSectionCompleteList)
        ? i18n.t('record.overview.seal-complete-warning')
        : i18n.t('record.overview.seal-incomplete-warning'),
      async () => {
        onComplete(flatRecordToRecordType(flatRecord))
        reloadPrevious.current = true
      },
      () => 0
    )
  }, [onComplete, flatRecord])

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
            recordMetadataRef.current.sealedByUUID,
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

  function disableRecordCommands(
    shouldDisable: boolean,
    commands: RenderCommand[]
  ) {
    if (!shouldDisable) return commands
    return disableRenderCommands(commands)
  }

  const renderCommands = disableRecordCommands(
    (isSealed || readOnly) && !(overviewSection && currentSection === 0),
    !_.isEmpty(formSections) && form && 'common' in form
      ? transformToLayout(
          overviewSection && currentSection === 0
            ? recordOverviewPage(
                recordMetadataRef,
                formMetadata,
                users,
                isSealed,
                associatedRecords,
                selectAssociatedRecord,
                shares,
                selectShare
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
  )

  const setRecordPath = useCallback(
    (path: RecordValuePath, value: RecordValue) => {
      const r = recordValueSchema.safeParse(value)
      if (!r.success) console.error('Failed parse field', r, value)
      setFlatRecordValue(
        _.join(path, '.'),
        // @ts-ignore TODO What is a good default here?
        r.success ? r.data : ''
      )
    },
    [setFlatRecordValue]
  )
  const renderItem = useCallback(
    ({ item }: any) =>
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
    if (!_.isEmpty(changedPaths)) {
      onChange()
    }
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
    <View style={layout.flex1}>
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
          onExit={onExit}
          onSaveAndExit={onSaveAndExitRecord}
          onSave={onSaveRecord}
          onCompleteRecord={onCompleteRecord}
          onPrint={onExit}
          changed={changed}
          isSealed={isSealed}
          readOnly={readOnly}
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
                onExit={onExit}
                onSaveAndExit={onSaveAndExitRecord}
                onCompleteRecord={onCompleteRecord}
                onPrint={onExit}
                onAddRecord={onAddRecord}
                onShareRecord={onShareRecord}
                onUpgrade={onUpgrade}
                changed={changed}
                onSave={onSaveRecord}
                isSealed={isSealed}
                readOnly={readOnly}
                hasAssociatedForms={
                  formMetadata.associatedForms
                    ? formMetadata.associatedForms.length > 0
                    : false
                }
                // topSpace="0.5"
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
