import React, { useState, useEffect, useRef, useCallback } from 'react'
import useMap from 'react-use/lib/useMap'
import usePrevious from 'react-use/lib/usePrevious'
import useSet from 'react-use/lib/useSet'
import { View, ScrollView, Keyboard } from 'react-native'
// @ts-ignore TODO Why doesn't typescript know about this module?
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import SideMenu from 'react-native-side-menu'
import _ from 'lodash'

import styles from 'styles'
import Menu from 'components/FormMenu'
import Top from 'components/FormTop'
import Bottom from 'components/FormBottom'

import { loadForm } from 'utils/forms'
import { FormType } from 'utils/formTypes'
import renderFnsWrapper from 'utils/formRendering'
import {
  nameFormSections,
  mapSectionWithPaths,
  isSectionComplete,
} from 'utils/forms'
import { NamedFormSection, NamedFormPart } from 'utils/formTypesHelpers'

type Props = NativeStackScreenProps

function formGetPath(
  formPaths: Record<string, any>,
  valuePath: string,
  default_: any = null
) {
  if (_.startsWith(valuePath, 'inferred.')) {
    switch (valuePath) {
      case 'inferred.sex': {
        let value = _.find(
          formPaths,
          (v, k) =>
            _.includes(k, '.sex.value') ||
            // These two are definitely not equivalent, but some forms may not
            // include both
            _.includes(k, '.gender.value')
        )
        if (typeof value === 'string') {
          return value
        }
        return default_
      }
      case 'inferred.age-of-majority': {
        // TODO Should this vary by country?
        return 18
      }
      case 'inferred.age': {
        let value = _.find(formPaths, (v, k) => _.includes(k, '.age.value'))
        if (typeof value === 'number') {
          return value
        }
        return default_
      }
      default:
        // TODO Error handling
        console.log("Don't know how to compute this inferred value", valuePath)
    }
  }
  return _.has(formPaths, valuePath) ? formPaths[valuePath] : default_
}

export default function Form({
  files,
  form,
  hasSideMenu,
  hasBottom = true,
}: {
  files: Record<string, any>
  form: FormType | undefined
  hasSideMenu: boolean
  hasBottom: boolean
}) {
  if (form === undefined) return null
  const formSections = nameFormSections(form.sections)
  const [currentSection, setCurrentSection] = useState(0)

  // This is state about the current properties of widgets, like if a date-time
  // picker is open or not.
  const [dynamicState, setDynamicState] = useState(
    {} as Record<string, boolean>
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

  const isSectionCompleteList = form
    ? _.map(formSections, section =>
        isSectionComplete(
          section,
          form.common,
          (value: string) => formGetPath(formPaths, value, null)
          // TODO defaults
          // (value: string, default_: any) =>
          // formGetPath(formPaths, value, default_)
        )
      )
    : []

  const sideMenu = useRef(null)
  const scrollView = useRef(null)

  const setSectionOffset = useCallback(
    (offset: number) => setCurrentSection(currentSection + offset),
    [currentSection]
  )

  const openSideMenu = useCallback(() => {
    Keyboard.dismiss()
    sideMenu.current.openMenu(true)
  }, [sideMenu.current])

  const menuChangeSection = useCallback(
    i => {
      setCurrentSection(i)
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
    () => console.log('TODO signature'),
    () => console.log('TODO body'),
    formPaths,
    (value, default_) => formGetPath(formPaths, value, default_),
    setFormPath,
    changedPaths,
    keepAlive,
    removeKeepAlive,
    addKeepAlive
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

  let top = null
  let bottom = null
  if (!_.isEmpty(formSections)) {
    top = (
      <Top
        sectionOffset={setSectionOffset}
        currentSection={currentSection}
        openSideMenu={openSideMenu}
        hasSideMenu={hasSideMenu}
        title={formSections[currentSection].title}
        lastSection={formSections.length - 1}
        isSectionCompleted={isSectionCompleteList[currentSection]}
      />
    )
    bottom = hasBottom && (
      <Bottom
        sectionOffset={setSectionOffset}
        currentSection={currentSection}
        title={formSections[currentSection].title}
        lastSection={formSections.length - 1}
        isSectionCompleted={isSectionCompleteList[currentSection]}
      />
    )
  }

  const wrapper = (inner: JSX.Element) =>
    hasSideMenu ? (
      <SideMenu
        ref={sideMenu}
        menu={
          <Menu
            formSections={formSections}
            changeSection={menuChangeSection}
            isSectionCompleteList={isSectionCompleteList}
          />
        }
      >
        {inner}
      </SideMenu>
    ) : (
      inner
    )

  return wrapper(
    <>
      {top}
      <ScrollView
        ref={scrollView}
        style={styles.wideContainer}
        keyboardDismissMode="on-drag"
        accessible={false}
        keyboardShouldPersistTaps="handled"
      >
        {sectionContent}
        {bottom}
      </ScrollView>
    </>
  )
}
