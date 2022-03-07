jest.mock('i18n-js', () => ({ t: jest.fn(translation => translation) }))
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  launchCameraAsync: jest
    .fn()
    .mockResolvedValue({ cancelled: false, base64: 'MOCK' }),
}))

import {
  render,
  fireEvent,
  waitFor,
  act,
  FireEventAPI,
} from '@testing-library/react-native'
import fs from 'fs'
import yaml from 'js-yaml'
import { createGenerator } from 'ts-json-schema-generator'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import betterAjvErrors from 'better-ajv-errors'
import jsf from 'json-schema-faker'
import Form from 'components/Form'
import { renderCommand } from 'utils/formRendering/renderer'
import { GetValueFn, mapSectionWithPaths } from 'utils/forms'
import { ArrayElement, NamedFormSection, FormFns } from 'utils/formTypesHelpers'
import {
  RecordType,
  RecordSections,
  RecordPath,
  RecordDataByType,
} from 'utils/recordTypes'
import { allFormRenderCommands } from 'utils/formRendering/commands'
import _ from 'lodash'
import React from 'react'
import { Text } from 'react-native'
import { FlatList } from 'react-native'
import { NativeBaseProvider } from 'native-base'
import {
  FormValueType,
  FormPart,
  FormSectionMap,
  FormPartMap,
  FormDefinition,
  FormRef,
  FormConditional,
} from 'utils/formTypes'

import { toSatisfy } from 'jest-extended'
expect.extend({ toSatisfy })

const formSchema = createGenerator({
  path: 'src/utils/formTypes.ts',
  tsconfig: 'tsconfig.dummy.json',
  type: '*',
}).createSchema('FormType')
const recordSchema = createGenerator({
  path: 'src/utils/recordTypes.ts',
  tsconfig: 'tsconfig.dummy.json',
  type: '*',
}).createSchema('RecordType')
const formSchemaProcessed = JSON.parse(JSON.stringify(formSchema))
const recordSchemaProcessed = JSON.parse(JSON.stringify(recordSchema))

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
}

export function formSectionRenderTest(sectionContents: NamedFormSection) {
  const formPaths = {} as Record<string, any>
  const setRecordPath = jest.fn((path: RecordPath, value: any) => {
    formPaths[_.join(path, '.')] = value
  })
  const addKeepAlive = jest.fn()
  const removeKeepAlive = jest.fn()
  const getRecordPath = jest.fn((recordPath: RecordPath, default_: any) => {
    const stringPath = _.join(recordPath, '.')
    return stringPath in formPaths ? formPaths[stringPath] : default_
  })
  const commands = allFormRenderCommands({}, sectionContents, {}, getRecordPath)
  const elements = _.map(commands, command =>
    React.cloneElement(
      // @ts-ignore
      renderCommand(command, setRecordPath, addKeepAlive, removeKeepAlive),
      { key: command.key }
    )
  )
  const { debug, getAllByA11yLabel, getByText } = render(
    <NativeBaseProvider initialWindowMetrics={inset}>
      {elements}
    </NativeBaseProvider>
  )
  return {
    debug,
    getAllByA11yLabel,
    getByText,
    formPaths,
    commands,
    elements,
    getRecordPath,
    setRecordPath,
  }
}

export function expectSchemaToValidate(schema: any, data: any) {
  const ajv = addFormats(new Ajv())
  const dataProcessed = JSON.parse(JSON.stringify(data))
  const valid = ajv.validate(schema, dataProcessed)
  if (!valid) {
    console.error(
      betterAjvErrors(
        schema,
        dataProcessed,
        // @ts-ignore
        ajv.errors,
        {
          format: 'cli',
          indent: 2,
        }
      )
    )
  }
  expect(valid).toBe(true)
}

export async function formFieldTest({
  sectionContents,
  nrOfCommands = 0,
  nrOfElements = 0,
  expectedGetCalls = [],
  events = [],
  expectedSetCalls = [],
  debugTest = false,
  debugTestAfterFire = false,
  debugRecord = false,
  waitforMs = undefined,
}: {
  sectionContents: NamedFormSection
  nrOfCommands?: number
  nrOfElements?: number
  expectedGetCalls?: { path: string[]; defaultValue: any }[]
  events?: (
    | { type: 'fire'; label: string }
    | { type: 'text'; label: string; value: string }
  )[]
  expectedSetCalls?: { path: string[]; value: any }[]
  debugTest?: boolean
  debugTestAfterFire?: boolean
  debugRecord?: boolean
  waitforMs?: boolean
}) {
  const {
    debug,
    getAllByA11yLabel,
    formPaths,
    commands,
    elements,
    getRecordPath,
    setRecordPath,
  } = formSectionRenderTest(sectionContents)
  //
  if (debugTest) {
    debug(expect.getState().currentTestName)
  }
  //
  expect(commands).toHaveLength(nrOfCommands)
  expect(elements).toHaveLength(nrOfElements)
  expect(getRecordPath).toHaveBeenCalledTimes(expectedGetCalls.length)
  _.map(expectedGetCalls, (call, nr) =>
    expect(getRecordPath).toHaveBeenNthCalledWith(
      nr + 1,
      call.path,
      call.defaultValue
    )
  )
  //
  _.map(events, event => {
    if (event.type === 'fire')
      fireEvent.press(getAllByA11yLabel(event.label)[0])
    if (event.type === 'text')
      fireEvent.changeText(getAllByA11yLabel(event.label)[0], event.value)
  })
  //
  if (waitforMs) {
    await waitFor(() =>
      expect(setRecordPath).toHaveBeenCalledTimes(expectedSetCalls.length)
    )
  }
  //
  if (debugTestAfterFire) {
    debug(expect.getState().currentTestName)
  }
  //
  expect(setRecordPath).toHaveBeenCalledTimes(expectedSetCalls.length)
  _.map(expectedSetCalls, (call, nr) =>
    expect(setRecordPath).toHaveBeenNthCalledWith(nr + 1, call.path, call.value)
  )
  let record = { 'storage-version': '1.0.0', sections: {} } as RecordType
  _.map(formPaths, (v, p) => _.set(record, p, v))
  if (debugRecord) {
    console.log('Record', JSON.stringify(record, null, 2))
  }
  expectSchemaToValidate(recordSchemaProcessed, record)
}

export function populateTypes(
  section: NamedFormSection,
  commonRefTable: Record<string, FormDefinition>,
  getValue: GetValueFn
) {
  const record = {} as Record<string, any>
  function setType(valuePath: (string | number)[], type: string) {
    record[_.join(_.dropRight(valuePath).concat('type'), '.')] = type
  }
  mapSectionWithPaths<any>(section, commonRefTable, null, getValue, {
    pre: () => null,
    // TODO
    selectMultiple: () => null,
    address: valuePath => setType(valuePath, 'address'),
    'body-image': valuePath => setType(valuePath, 'body-image'),
    bool: valuePath => setType(valuePath, 'bool'),
    date: valuePath => setType(valuePath, 'date'),
    'date-time': valuePath => setType(valuePath, 'date-time'),
    email: valuePath => setType(valuePath, 'email'),
    gender: valuePath => setType(valuePath, 'gender'),
    list: valuePath => setType(valuePath, 'list'),
    'list-with-labels': valuePath => setType(valuePath, 'list-with-labels'),
    // TODO
    'list-with-parts': valuePath => setType(valuePath, 'list-with-parts'),
    'long-text': valuePath => setType(valuePath, 'long-text'),
    number: valuePath => setType(valuePath, 'number'),
    'phone-number': valuePath => setType(valuePath, 'phone-number'),
    photo: valuePath => setType(valuePath, 'photo'),
    sex: valuePath => setType(valuePath, 'sex'),
    text: valuePath => setType(valuePath, 'text'),
    signature: valuePath => setType(valuePath, 'signature'),
    combinePlainParts: () => null,
    combineSmartParts: () => null,
    preRepeat: () => null,
    preEachRepeat: () => null,
    eachRepeat: () => null,
    postRepeated: () => null,
    post: () => null,
  })
  return record
}

export function formPathsToRecord(
  sectionContents: NamedFormSection,
  getValue: GetValueFn,
  formPaths: Record<string, any>
) {
  let record = { 'storage-version': '1.0.0', sections: {} } as RecordType
  populateTypes(sectionContents, {}, getValue)
  _.map(formPaths, (v, p) => {})
  return record
}
