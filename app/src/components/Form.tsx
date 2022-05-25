import React, { useState, useCallback } from 'react'
import useMap from 'react-use/lib/useMap'
import usePrevious from 'react-use/lib/usePrevious'
import useSet from 'react-use/lib/useSet'
import useToggle from 'react-use/lib/useToggle'
import {
  Keyboard,
  // Don't use the native-base FlatList. It's buggy!
  FlatList,
} from 'react-native'
import _ from 'lodash'
import { useInfo } from 'utils/errors'
import { ZodError } from 'zod'

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

// FIXME Temproary hack before rewriting Form to invert control back to
// RecordEditor and show error messages
function getRecordFromManifest(
  recordManifest: RecordManifestWithData | undefined
): FlatRecord {
  if (!recordManifest) return {}
  const r = getRecordTypeFormManifest(recordManifest)
  if (!r || r instanceof ZodError) {
    console.log('FIXME OLD STYLE RECORD')
    return {}
  }
  return recordTypeToFlatRecord(r)
}

export default function Form({
  formManifest,
  recordManifest,
  addPhotoToManifest = () => null,
  removePhotoFromManifest = () => null,
  onCancel,
  onSaveAndExit,
  onComplete,
  disableMenu = false,
}: {
  formMetadata: FormMetadata
  formManifest: FormManifestWithData
  recordMetadata?: RecordMetadata
  recordManifest?: RecordManifestWithData
  addPhotoToManifest?: (uri: string) => any
  removePhotoFromManifest?: (sha256: string) => any
  noRenderCache?: boolean
  onCancel: () => any
  onSaveAndExit: (record: RecordType) => any
  onComplete: (record: RecordType) => any
  disableMenu?: boolean
}) {
  const [flatRecord, { set: setFlatRecordValue }] = useMap(
    getRecordFromManifest(recordManifest)
  )

  const form = getFormTypeFromManifest(formManifest)
  const formSections = nameFormSections(form.sections)
  const [keepAlive, { add: addKeepAlive, remove: removeKeepAlive }] = useSet(
    new Set([] as string[])
  )

  const [currentSection, setCurrentSection] = useState(0)
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

  const layoutType = useBreakpointValue({
    base: 'phone',
    md: 'compact',
    lg: 'large',
  }) as 'phone' | 'compact' | 'large'

  const renderCommands =
    !_.isEmpty(formSections) && form && 'common' in form
      ? transformToLayout(
          allFormRenderCommands(
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
      setFlatRecordValue(_.join(path, '.'), recordValueSchema.parse(value))
    },
    [setFlatRecordValue]
  )
  const renderItem = useCallback(
    ({ item }) =>
      renderCommand(
        item,
        setRecordPath,
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
          onCompleteRecord={onCompleteRecord}
          onPrint={onCancel}
        />
      ) : (
        <FlatList
          style={style}
          data={renderCommands}
          renderItem={renderItem}
          initialNumToRender={10}
          windowSize={25}
        />
      )}
    </View>
  )
}

const style = { height: 800, backgroundColor: '#fff', padding: 10 }
