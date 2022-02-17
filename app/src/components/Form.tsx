import React, { useState, useRef, useCallback } from 'react'
import useMap from 'react-use/lib/useMap'
import usePrevious from 'react-use/lib/usePrevious'
import useSet from 'react-use/lib/useSet'
import useToggle from 'react-use/lib/useToggle'
import { Keyboard } from 'react-native'
import _ from 'lodash'
import fp from 'lodash/fp'
import { diff } from 'deep-object-diff'

import { Box, View, ScrollView } from 'native-base'

import FormMenu from 'components/FormMenu'
import FromTop from 'components/FormTop'

import { FormType } from 'utils/formTypes'
import { RecordType, RecordPath } from 'utils/recordTypes'
import getRecordPath from 'utils/formInferences'
import renderFnsWrapper from 'utils/formRendering'
import {
  nameFormSections,
  mapSectionWithPaths,
  isSectionComplete,
} from 'utils/forms'

export default function Form({
  files,
  form,
  noRenderCache = false,
  onCancel,
}: {
  files: Record<string, any>
  form: FormType | undefined
  noRenderCache?: boolean
  onCancel: () => any
}) {
  // This can happen when editing forms live
  if (form === undefined) return null

  const formSections = nameFormSections(form.sections)
  const [currentSection, setCurrentSection] = useState(0)
  const setSectionOffset = useCallback(
    (offset: number) => setCurrentSection(currentSection + offset),
    [currentSection]
  )

  // This section handles caching. Since forms are so dynamic React ends up
  // wanting to rerender them a lot. This allows us to cut off the process early
  // by checking which parts of the from were updated and which parts want to be
  // rerendered unconditionally.
  const [formPaths, { set: setFormPath }] = useMap({} as Record<string, any>)
  const [keepAlive, { add: addKeepAlive, remove: removeKeepAlive }] = useSet(
    new Set([] as string[])
  )
  const previousFormPaths = usePrevious(formPaths)
  let changedPaths = []
  for (const key of _.union(_.keys(formPaths), _.keys(previousFormPaths))) {
    if (previousFormPaths && formPaths[key] !== previousFormPaths[key]) {
      changedPaths.push(key)
    }
  }

  // TODO Debugging until this is tested
  if (0) {
    if (changedPaths !== []) {
      let record = {}
      _.map(formPaths, (v, p) => _.set(record, p, v))
      console.log('Record', record)
    }
  }

  const isSectionCompleteList = form
    ? _.map(formSections, section =>
        isSectionComplete(section, form.common, (value: RecordPath) =>
          getRecordPath(formPaths, value, null)
        )
      )
    : []

  // The side menu, although depending on the size of the viewport we sometimes
  // display it on top
  const [isMenuVisible, rawToggleMenu] = useToggle(false)
  const scrollView = useRef(null as any)
  const toggleMenu = useCallback(() => {
    // Users are very likely to be editing a field
    Keyboard.dismiss()
    rawToggleMenu()
  }, [])

  const menuChangeSection = useCallback(
    (i: number) => {
      setCurrentSection(i)
      scrollView.current &&
        scrollView.current.scrollTo({ x: 0, y: 0, animated: true })
    },
    [currentSection, scrollView.current]
  )

  const setRecordPath = useCallback(
    (path: RecordPath, value: any) => {
      setFormPath(_.join(path, '.'), value)
    },
    [formPaths]
  )

  const renderFns = renderFnsWrapper(
    files,
    form ? form.common : {},
    () => console.log('TODO body'),
    (value: RecordPath, default_: any) =>
      getRecordPath(formPaths, value, default_),
    setRecordPath,
    changedPaths,
    keepAlive,
    removeKeepAlive,
    addKeepAlive,
    noRenderCache
  )

  let sectionContent: null | JSX.Element = null
  if (!_.isEmpty(formSections) && form && 'common' in form) {
    const current_section_content = formSections[currentSection]
    sectionContent = mapSectionWithPaths<JSX.Element>(
      current_section_content,
      form.common,
      <></>,
      (value: RecordPath, default_: any) =>
        getRecordPath(formPaths, value, default_),
      renderFns
    )
  }

  return (
    <View flex={1}>
      <FromTop
        key={'form-top'}
        sectionOffset={setSectionOffset}
        currentSection={currentSection}
        toggleMenu={toggleMenu}
        title={formSections[currentSection].title}
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
        <ScrollView
          h="80"
          ref={scrollView}
          keyboardDismissMode="on-drag"
          accessible={false}
          keyboardShouldPersistTaps="handled"
          bg="white"
        >
          {sectionContent}
        </ScrollView>
      )}
    </View>
  )
}
