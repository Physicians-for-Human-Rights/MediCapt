import React, { useState, useRef, useMemo, useCallback } from 'react'
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
import { RecordPath } from 'utils/types/record'
import getFlatRecordValue from 'utils/formInferences'
import { RenderCommand } from 'utils/formRendering/types'
import { allFormRenderCommands } from 'utils/formRendering/commands'
import { renderCommand } from 'utils/formRendering/renderer'
import { transformToLayout } from 'utils/formRendering/transformations'
import { nameFormSections, isSectionComplete } from 'utils/forms'

export default function Form({
  files,
  form,
  noRenderCache = false,
  onCancel,
}: {
  files: Record<string, string>
  form: FormType | undefined
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
  const [flatRecord, { set: setFlatRecordValue }] = useMap(
    {} as Record<string, any>
  )
  const [keepAlive, { add: addKeepAlive, remove: removeKeepAlive }] = useSet(
    new Set([] as string[])
  )
  const previousFlatRecord = usePrevious(flatRecord)
  let changedPaths = []
  for (const key of _.union(_.keys(flatRecord), _.keys(previousFlatRecord))) {
    if (previousFlatRecord && flatRecord[key] !== previousFlatRecord[key]) {
      changedPaths.push(key)
    }
  }

  // TODO Debugging until this is tested
  if (1) {
    if (!_.isEqual(changedPaths, [])) {
      let record = {}
      _.map(flatRecord, (v, p) => _.set(record, p, v))
      console.log('Record+paths', record, flatRecord)
    }
  }

  const isSectionCompleteList = form
    ? _.map(formSections, section =>
        isSectionComplete(section, form.common, (value: RecordPath) =>
          getFlatRecordValue(flatRecord, value, null)
        )
      )
    : []

  // The side menu, although depending on the size of the viewport we sometimes
  // display it on top
  const [isMenuVisible, rawToggleMenu] = useToggle(false)
  // TODO do something with scrollView or remove
  // const scrollView = useRef(null as any)
  const toggleMenu = useCallback(() => {
    // Users are very likely to be editing a field
    Keyboard.dismiss()
    rawToggleMenu()
  }, [])

  const menuChangeSection = useCallback(
    (i: number) => {
      setCurrentSection(i)
      // scrollView.current &&
      //   scrollView.current.scrollTo({ x: 0, y: 0, animated: true })
    },
    [
      /*scrollView.current*/
    ]
  )

  const setRecordPath = useCallback((path: RecordPath, value: any) => {
    setFlatRecordValue(_.join(path, '.'), value)
  }, [])

  // outside of the if so the # of hooks doesn't change
  const [renderCommands, setRenderCommands] = useState([] as RenderCommand[])
  const renderItem = useCallback(
    ({ item }) =>
      renderCommand(item, setRecordPath, addKeepAlive, removeKeepAlive),
    []
  )

  if (!_.isEmpty(formSections) && form && 'common' in form) {
    const sectionContent = formSections[currentSection]
    const sectionCommands = transformToLayout(
      allFormRenderCommands(
        files,
        sectionContent,
        form.common,
        (path: RecordPath, default_: any) =>
          getFlatRecordValue(flatRecord, path, default_)
      ),
      layoutType
    )
    if (!_.isEqual(renderCommands, sectionCommands)) {
      setRenderCommands(sectionCommands)
    }
  } else {
    if (!_.isEmpty(renderCommands)) setRenderCommands([])
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
