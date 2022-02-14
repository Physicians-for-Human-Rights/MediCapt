import React, { useState, useRef, useCallback } from 'react'
import useMap from 'react-use/lib/useMap'
import usePrevious from 'react-use/lib/usePrevious'
import useSet from 'react-use/lib/useSet'
import useToggle from 'react-use/lib/useToggle'
import { Keyboard } from 'react-native'
import _ from 'lodash'

import { ScrollView } from 'native-base'

import FormMenu from 'components/FormMenu'
import FromTop from 'components/FormTop'

import { FormType } from 'utils/formTypes'
import formGetPath from 'utils/formInferences'
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
}: {
  files: Record<string, any>
  form: FormType | undefined
  noRenderCache?: boolean
}) {
  // This can happen when editing forms live
  if (form === undefined) return null

  const formSections = nameFormSections(form.sections)
  const [currentSection, setCurrentSection] = useState(0)
  const setSectionOffset = useCallback(
    (offset: number) => setCurrentSection(currentSection + offset),
    [currentSection]
  )

  // This is state about the current properties of widgets, like if a date-time
  // picker is open or not.
  const [dynamicState, setDynamicState] = useState(
    {} as Record<string, boolean>
  )

  // This section handles caching. Since forms are so dynamic React ends up
  // wanting to rerender them a lot. This allows us to cut off the process early
  // by checking which parts of the from were updated and which parts want to be
  // rerendered unconditionally.
  //
  // formPaths stores the content of the form. What we also call the record as a
  // map from strings to whatever values each particular field of a record wants
  // to store
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
  const isSectionCompleteList = form
    ? _.map(formSections, section =>
        isSectionComplete(section, form.common, (value: string) =>
          formGetPath(formPaths, value, null)
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

  const renderFns = renderFnsWrapper(
    dynamicState,
    (newState: Record<string, boolean>) =>
      setDynamicState(prevState => ({ ...prevState, ...newState })),
    files,
    form ? form.common : {},
    () => console.log('TODO body'),
    formPaths,
    (value: any, default_: any) => formGetPath(formPaths, value, default_),
    setFormPath,
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
      (path: string) => formGetPath(formPaths, path),
      renderFns
    )
  }

  return (
    <>
      <FromTop
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
        />
      ) : (
        <ScrollView
          ref={scrollView}
          keyboardDismissMode="on-drag"
          accessible={false}
          keyboardShouldPersistTaps="handled"
        >
          {sectionContent}
        </ScrollView>
      )}
    </>
  )
}
