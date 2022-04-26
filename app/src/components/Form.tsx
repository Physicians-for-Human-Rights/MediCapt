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
import { RecordValue, RecordValuePath, FlatRecord } from 'utils/types/record'
import { allFormRenderCommands } from 'utils/formRendering/commands'
import { renderCommand } from 'utils/formRendering/renderer'
import { transformToLayout } from 'utils/formRendering/transformations'
import { nameFormSections, isSectionComplete } from 'utils/forms'

export default function Form({
  form,
  files,
  onCancel,
}: {
  form: FormType | undefined
  files: Record<string, string>
  noRenderCache?: boolean
  onCancel: () => any
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
  const menuChangeSection = useCallback((i: number) => setCurrentSection(i), [])
  const setSectionOffset = useCallback(
    (offset: number) => setCurrentSection(currentSection + offset),
    [currentSection]
  )

  // The side menu, although depending on the size of the viewport
  // we sometimes display it on top
  const [isMenuVisible, rawToggleMenu] = useToggle(false)
  const toggleMenu = useCallback(() => {
    // Users are very likely to be editing a field
    Keyboard.dismiss()
    rawToggleMenu()
  }, [])

  const isSectionCompleteList = useMemo(
    () =>
      form
        ? _.map(formSections, section =>
            isSectionComplete(section, form.common, flatRecord)
          )
        : [],
    [form, formSections, flatRecord]
  )

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
  }, [formSections, currentSection, form])

  const setRecordPath = useCallback(
    (path: RecordValuePath, value: RecordValue) => {
      setFlatRecordValue(_.join(path, '.'), value)
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
  let changedPaths = []
  for (const key of _.union(_.keys(flatRecord), _.keys(previousFlatRecord))) {
    if (previousFlatRecord && flatRecord[key] !== previousFlatRecord[key]) {
      changedPaths.push(key)
    }
  }
  if (0) {
    if (!_.isEqual(changedPaths, [])) {
      const record = {}
      _.map(flatRecord, (v, p) => _.set(record, p, v))
      console.log('Record+paths', record, flatRecord)
    }
  }

  return (
    <View flex={1}>
      <FromTop
        key="form-top"
        sectionOffset={setSectionOffset}
        currentSection={currentSection}
        toggleMenu={toggleMenu}
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
          changeSection={menuChangeSection}
          toggleMenu={toggleMenu}
          isSectionCompleteList={isSectionCompleteList}
          onCancel={onCancel}
          onSaveAndExit={onCancel}
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
