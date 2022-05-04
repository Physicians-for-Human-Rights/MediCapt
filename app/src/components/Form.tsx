import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react'
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
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
import { RecordType } from 'utils/types/record'
import {
  RecordMetadata,
  RecordManifestWithData,
} from 'utils/types/recordMetadata'
import { lookupManifest } from 'utils/manifests'
import { useInfo } from 'utils/errors'
import yaml from 'js-yaml'

function listObjectPaths(tree: any) {
  var leaves: string[] = []
  var walk = function (obj: any, path: string) {
    path = path || ''
    for (var n in obj) {
      if (obj.hasOwnProperty(n)) {
        if (typeof obj[n] === 'object' || obj[n] instanceof Array) {
          walk(obj[n], path ? path + '.' + n : n)
        } else {
          leaves.push(path ? path + '.' + n : n)
        }
      }
    }
  }
  walk(tree, '')
  return leaves
}

function toFlatObject(tree: Record<string, any>) {
  var leaves: Record<string, any> = {}
  var walk = function (obj: any, path: string) {
    path = path || ''
    for (var n in obj) {
      if (obj.hasOwnProperty(n)) {
        if (typeof obj[n] === 'object' || obj[n] instanceof Array) {
          walk(obj[n], path ? path + '.' + n : n)
        } else {
          leaves[path ? path + '.' + n : n] = obj[n]
        }
      }
    }
  }
  walk(tree, '')
  return leaves
}

export default function Form({
  formMetadata,
  formManifest,
  recordMetadata,
  recordManifest,
  setRecord,
  noRenderCache = false,
  onCancel,
  onSaveAndExit,
  onComplete,
}: {
  formMetadata: FormMetadata
  formManifest: FormManifestWithData
  recordMetadata: Partial<RecordMetadata>
  recordManifest: RecordManifestWithData
  setRecord: (record: RecordType) => any
  noRenderCache?: boolean
  onCancel: () => any
  onSaveAndExit: () => any
  onComplete: () => any
}) {
  const [form, setForm] = React.useState({} as FormType)

  // Pull the initial contents from the manifest
  useEffect(() => {
    try {
      const f = lookupManifest(
        formManifest,
        e => e.filetype === 'text/yaml' && e.filename === 'form.yaml'
      )
      if (f) {
        setForm(yaml.load(f.data) as FormType)
      } else {
        console.error('Bad form TODO')
      }
    } catch (e) {
      // TODO Error handling
      console.error(e)
    }
  }, [formManifest])

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
  const [flatRecord, { set: setFlatRecordValue, setAll: setFlatRecord }] =
    useMap({} as Record<string, any>)
  const [keepAlive, { add: addKeepAlive, remove: removeKeepAlive }] = useSet(
    new Set([] as string[])
  )
  const previousFlatRecord = usePrevious(flatRecord)
  let changedPaths: string[] = []
  for (const key of _.union(_.keys(flatRecord), _.keys(previousFlatRecord))) {
    if (previousFlatRecord && flatRecord[key] !== previousFlatRecord[key]) {
      changedPaths.push(key)
    }
  }

  // When we have meaningful changes, we sync up the record
  useEffect(() => {
    if (!_.isEqual(changedPaths, [])) {
      let record = {}
      _.map(flatRecord, (v, p) => _.set(record, p, v))
      // @ts-ignore This is correct, it is the record type. TODO We should validate it
      setRecord(record)
    }
  }, [changedPaths])

  // Pull the initial contents from the manifest
  useEffect(() => {
    try {
      const f = lookupManifest(
        recordManifest,
        e => e.filetype === 'text/json' && e.filename === 'record.json'
      )
      if (f) {
        const record = JSON.parse(f.data)
        setFlatRecord(toFlatObject(record))
      }
    } catch (e) {
      // TODO Error handling
      console.error('Failed to pull record', e)
    }
  }, [])

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
        _.concat(formManifest.contents || [], recordManifest.contents || []),
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
