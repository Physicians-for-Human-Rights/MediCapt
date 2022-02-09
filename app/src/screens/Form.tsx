import React, { useState, useEffect, useRef, useCallback } from 'react'
import useMap from 'react-use/lib/useMap'
import usePrevious from 'react-use/lib/usePrevious'
import useSet from 'react-use/lib/useSet'
import { View, ScrollView, Keyboard } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  Icon,
  Button,
  ListItem,
  ButtonGroup,
  Card,
  Image,
} from 'react-native-elements'
import SideMenu from 'react-native-side-menu'
import _ from 'lodash'

import styles from 'styles'
import Menu from 'components/FormMenu'
import Top from 'components/FormTop'
import Bottom from 'components/FormBottom'

import { FormInfo, loadForm } from 'utils/forms'
import renderFnsWrapper from 'utils/formRendering'
import { mapSectionWithPaths, isSectionComplete } from 'utils/forms'

type Props = NativeStackScreenProps

function formGetPath(
  formPaths: Record<string, any>,
  valuePath: string,
  default_: any = null
) {
  return _.has(formPaths, valuePath) ? formPaths[valuePath] : default_
}

export default function Form({ route, navigation }: Props) {
  const { formInfo }: { formInfo: FormInfo } = route.params

  const [loadedForm, setLoadedForm] = useState({
    files: null,
    form: null,
    formSections: null,
  })
  const { formSections } = loadedForm

  const [currentSection, setCurrentSection] = useState(0)

  // This is state about the current properties of widgets, like if a date-time
  // picker is open or not.
  const [dynamicState, setDynamicState] = useState({})

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
    if (formPaths[key] !== previousFormPaths[key]) {
      changedPaths.push(key)
    }
  }

  const isSectionCompleteList = _.map(formSections, section =>
    isSectionComplete(section, (value, default_) =>
      formGetPath(formPaths, value, default_)
    )
  )
  console.log(isSectionCompleteList)

  const sideMenu = useRef(null)
  const scrollView = useRef(null)

  useEffect(() => {
    async function fn() {
      const l = await loadForm(formInfo)
      setLoadedForm(l)
    }
    fn()
  }, [])

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
    newState => setDynamicState(prevState => ({ ...prevState, ...newState })),
    loadedForm,
    navigation,
    formPaths,
    (value, default_) => formGetPath(formPaths, value, default_),
    (valuePath, value) => setFormPath(valuePath, value),
    changedPaths,
    keepAlive,
    removeKeepAlive,
    addKeepAlive
  )
  let sectionContent = []
  if (formSections) {
    const current_section_content = formSections[currentSection]
    sectionContent = mapSectionWithPaths(
      current_section_content,
      (path: string) => formGetPath(formPaths, path),
      renderFns
    )
  }

  let top = null
  let bottom = null
  if (formSections) {
    top = (
      <Top
        sectionOffset={setSectionOffset}
        currentSection={currentSection}
        openSideMenu={openSideMenu}
        title={formSections[currentSection].title}
        lastSection={formSections.length - 1}
        isSectionCompleted={isSectionCompleteList[currentSection]}
      />
    )
    bottom = (
      <Bottom
        sectionOffset={setSectionOffset}
        currentSection={currentSection}
        openSideMenu={openSideMenu}
        formGetPath={value => formGetPath(formPaths, value, null)}
        title={formSections[currentSection].title}
        lastSection={formSections.length - 1}
        isSectionCompleted={isSectionCompleteList[currentSection]}
      />
    )
  }

  return (
    <View style={styles.container}>
      <SideMenu
        ref={sideMenu}
        menu={
          <Menu
            navigation={navigation}
            formSections={formSections}
            changeSection={menuChangeSection}
            isSectionCompleteList={isSectionCompleteList} // TODO
          />
        }
      >
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
      </SideMenu>
    </View>
  )
}
