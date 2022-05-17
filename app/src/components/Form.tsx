import React, { useState, useMemo, useCallback, useEffect } from 'react'
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

import { View, useBreakpointValue } from 'native-base'

import FormMenu from 'components/FormMenu'
import FromTop from 'components/FormTop'

import { FormType } from 'utils/types/form'
import {
  RecordValue,
  RecordValuePath,
  FlatRecord,
  recordValueSchema,
} from 'utils/types/record'
import { allFormRenderCommands } from 'utils/formRendering/commands'
import { renderCommand } from 'utils/formRendering/renderer'
import { transformToLayout } from 'utils/formRendering/transformations'
import { nameFormSections, isSectionComplete } from 'utils/forms'
import { recordTypeToFlatRecord, flatRecordToRecordType } from 'utils/records'
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
import { RecordType } from 'utils/types/record'
import {
  RecordMetadata,
  RecordManifestWithData,
} from 'utils/types/recordMetadata'
import { lookupManifest } from 'utils/manifests'
import yaml from 'js-yaml'

export default function Form({
  formMetadata,
  formManifest,
  recordMetadata = undefined,
  recordManifest = undefined,
  setRecord = () => null,
  noRenderCache = false,
  onCancel,
  onSaveAndExit,
  onComplete,
  disableMenu = false,
}: {
  formMetadata: FormMetadata
  formManifest: FormManifestWithData
  recordMetadata?: Partial<RecordMetadata>
  recordManifest?: RecordManifestWithData
  setRecord?: (record: RecordType) => void
  noRenderCache?: boolean
  onCancel: () => void
  onSaveAndExit: () => void
  onComplete: () => void
  disableMenu?: boolean
}) {
  const [form, setForm] = React.useState({} as FormType)
  const [flatRecord, { set: setFlatRecordValue, setAll: setFlatRecord }] =
    useMap({} as FlatRecord)

  const formSections = useMemo(() => nameFormSections(form.sections), [form])
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

  const isSectionCompleteList = useMemo(
    () =>
      form
        ? _.map(formSections, section =>
            isSectionComplete(section, form.common, flatRecord)
          )
        : [],
    [form, formSections, flatRecord]
  )

  // const onSaveAndExit = useCallback(() => {
  //   const record = flatRecordToRecordType(flatRecord)
  //   console.log(record)
  //   // onCancel()
  // }, [flatRecord])

  const layoutType = useBreakpointValue({
    base: 'phone',
    md: 'compact',
    lg: 'large',
  }) as 'phone' | 'compact' | 'large'

  const renderCommands = useMemo(() => {
    if (!_.isEmpty(formSections) && form && 'common' in form) {
      const sectionContent = formSections[currentSection]
      return transformToLayout(
        allFormRenderCommands(
          sectionContent,
          form.common,
          _.concat(
            formManifest.contents || [],
            (recordManifest && recordManifest.contents) || []
          ),
          flatRecord
        ),
        layoutType
      )
    } else {
      return []
    }
  }, [
    formSections,
    currentSection,
    form,
    formManifest,
    recordManifest,
    flatRecord,
  ])

  const setRecordPath = useCallback(
    (path: RecordValuePath, value: RecordValue) => {
      setFlatRecordValue(_.join(path, '.'), recordValueSchema.parse(value))
    },
    [setFlatRecordValue]
  )
  const renderItem = useCallback(
    ({ item }) =>
      renderCommand(item, setRecordPath, addKeepAlive, removeKeepAlive),
    [setRecordPath, addKeepAlive, removeKeepAlive]
  )

  // Pull the initial contents from the form manifest
  useEffect(() => {
    try {
      const formFile = lookupManifest(
        formManifest,
        e => e.filetype === 'text/yaml' && e.filename === 'form.yaml'
      )
      if (formFile) {
        setForm(yaml.load(formFile.data) as FormType)
      } else {
        console.error('Bad form TODO')
      }
    } catch (e) {
      // TODO Error handling
      console.error(e)
    }
  }, [formManifest, setForm])

  // Pull the initial contents from the record manifest
  useEffect(() => {
    if (!recordManifest) return
    try {
      const recordFile = lookupManifest(
        recordManifest,
        e => e.filetype === 'text/json' && e.filename === 'record.json'
      )
      if (recordFile) {
        const record = recordTypeToFlatRecord(JSON.parse(recordFile.data))
        setFlatRecord(record)
      }
    } catch (e) {
      // TODO Error handling
      console.error('Failed to pull record', e)
    }
  }, [recordManifest, setFlatRecord])

  // // When we have meaningful changes, we sync up the record
  // useEffect(() => {
  //   const record = flatRecordToRecordType(flatRecord)
  //   setRecord(record)
  //   // TODO Debugging until this is tested
  //   console.log(flatRecord)
  //   console.log(record)
  // }, [flatRecord, setRecord])

  // TODO Debugging until this is tested
  const previousFlatRecord = usePrevious(flatRecord)
  const changedPaths = _.reduce(
    _.union(_.keys(flatRecord), _.keys(previousFlatRecord)),
    (changedPaths: string[], key) => {
      if (previousFlatRecord && flatRecord[key] !== previousFlatRecord[key]) {
        return changedPaths.concat(key)
      }
      return changedPaths
    },
    []
  )
  if (!_.isEqual(changedPaths, [])) {
    console.log(flatRecord)
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
          onSaveAndExit={onSaveAndExit}
          onCompleteRecord={onComplete}
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
