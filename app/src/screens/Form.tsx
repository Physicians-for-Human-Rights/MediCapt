import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Picker,
  Platform,
  ImageBackground,
} from 'react-native'
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
import DateTimePicker from 'components/DateTimePicker'

import _ from 'lodash'
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import { connect } from 'react-redux'

import yaml from 'js-yaml'
import styles from 'styles'
import allForms from 'allForms'
import Menu from 'components/FormMenu'
import Top from 'components/FormTop'
import Bottom from 'components/FormBottom'

import { FormInfo, loadForm } from 'utils/forms'
import renderFnsWrapper from 'utils/formRendering'

import { mapSectionWithPaths, readImage, isSectionComplete } from 'utils/forms'

type Props = NativeStackScreenProps

function formGetPath(
  formPaths: Record<string, any>,
  valuePath: string,
  default_: any = null
) {
  return formPaths[valuePath] ? formPaths[valuePath].value : default_
}

function formSetPath(
  formPaths: Record<string, any>,
  setFormPaths,
  valuePath,
  value
) {
  // TODO There was caching here once upon a time, if we don't do it anymore,
  // remove this function
  setFormPath(formPaths, setFormPaths, valuePath, value)
}

function setFormPath(
  formPaths: Record<string, any>,
  setFormPaths: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  path: string,
  value: any
) {
  setFormPaths({
    ...formPaths,
    [path]: {
      value: value,
    },
  })
}

export default function Form({ route, navigation }: Props) {
  const { formInfo }: { formInfo: FormInfo } = route.params

  const [loadedForm, setLoadedForm] = useState({
    files: null,
    form: null,
    formSections: null,
    // NB Recomputing this each update introduces noticeable lag.
    sectionCompletionStatusCache: [],
  })
  const { formSections } = loadedForm

  const [currentSection, setCurrentSection] = useState(0)
  const [formPaths, setFormPaths] = useState({} as Record<string, any>)

  // This is state about the current properties of widgets, like if a date-time
  // picker is open or not.
  const [dynamicState, setDynamicState] = useState({})

  const sideMenu = useRef(null)
  const scrollView = useRef(null)

  useEffect(() => {
    async function fn() {
      const l = await loadForm(formInfo)
      setLoadedForm(l)
    }
    fn()
  }, [])

  const renderFns = renderFnsWrapper(
    dynamicState,
    newState => setDynamicState(prevState => ({ ...prevState, ...newState })),
    loadedForm,
    navigator,
    formPaths,
    (value, default_) => formGetPath(formPaths, value, default_),
    (valuePath, value) => formSetPath(formPaths, setFormPaths, valuePath, value)
  )

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
        isSectionCompleted={false} // TODO
      />
    )
    bottom = (
      <Bottom
        sectionOffset={setSectionOffset}
        currentSection={currentSection}
        openSideMenu={openSideMenu}
        title={formSections[currentSection].title}
        lastSection={formSections.length - 1}
        isSectionCompleted={false} // TODO
      />
    )
  }
  return (
    <View style={styles.container}>
      <SideMenu
        ref={sideMenu}
        menu={
          <Menu
            navigator={navigator}
            formSections={formSections}
            changeSection={menuChangeSection}
            isSectionComplete={false} // TODO
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
