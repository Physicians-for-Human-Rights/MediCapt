import React, { useState, useCallback, useMemo } from 'react'
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
import { flatRecordToRecordType } from 'utils/records'

export default function Form({
  form,
  files,
  onCancel,
}: {
  form: FormType | undefined
  files: Record<string, string>
  noRenderCache?: boolean
  onCancel: () => void
}) {
  // This can happen when editing forms live
  if (form === undefined) return null

  const layoutType = useBreakpointValue({
    base: 'phone',
    md: 'compact',
    lg: 'large',
  })

  const formSections = useMemo(() => nameFormSections(form.sections), [form])
  const [flatRecord, { set: setFlatRecordValue }] = useMap({} as FlatRecord)
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

  const onSaveAndExit = useCallback(() => {
    const record = flatRecordToRecordType(flatRecord)
    console.log(record)
    // onCancel()
  }, [flatRecord])

  const renderCommands = useMemo(() => {
    if (!_.isEmpty(formSections) && form && 'common' in form) {
      const sectionContent = formSections[currentSection]
      return transformToLayout(
        allFormRenderCommands(sectionContent, form.common, files, flatRecord),
        layoutType
      )
    } else {
      return []
    }
  }, [formSections, currentSection, form, files, flatRecord])

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

  // TODO Debugging until this is tested
  const previousFlatRecord = usePrevious(flatRecord)
  const changedPaths = []
  for (const key of _.union(_.keys(flatRecord), _.keys(previousFlatRecord))) {
    if (previousFlatRecord && flatRecord[key] !== previousFlatRecord[key]) {
      changedPaths.push(key)
    }
  }
  if (1) {
    if (!_.isEqual(changedPaths, [])) {
      console.log(flatRecord)
    }
  }

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
      {isMenuVisible ? (
        <FormMenu
          formSections={formSections}
          changeSection={setSection}
          toggleMenu={toggleMenuVisible}
          isSectionCompleteList={isSectionCompleteList}
          onCancel={onCancel}
          onSaveAndExit={onSaveAndExit}
          onCompleteRecord={onCancel}
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
