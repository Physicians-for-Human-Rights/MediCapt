jest.mock('i18n-js', () => ({ t: jest.fn(translation => translation) }))
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  launchCameraAsync: jest
    .fn()
    .mockResolvedValue({ cancelled: false, base64: 'MOCK' }),
}))

import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { createGenerator } from 'ts-json-schema-generator'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import betterAjvErrors from 'better-ajv-errors'
import { renderCommand } from 'utils/formRendering/renderer'
import { NamedFormSection } from 'utils/types/formHelpers'
import { FlatRecord, RecordValuePath, RecordValue } from 'utils/types/record'
import { allFormRenderCommands } from 'utils/formRendering/commands'
import _ from 'lodash'
import React from 'react'
import { NativeBaseProvider } from 'native-base'
import { flatRecordToRecordType } from 'utils/records'

const formSchema = createGenerator({
  path: 'src/utils/types/form.tsx',
  tsconfig: 'tsconfig.dummy.json',
  type: '*',
}).createSchema('FormType')

const formSchemaProcessed = JSON.parse(JSON.stringify(formSchema))

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
}

export function formSectionRenderTest(sectionContents: NamedFormSection) {
  const flatRecord = {} as FlatRecord
  const setRecordPath = jest.fn((path: RecordValuePath, value: RecordValue) => {
    flatRecord[_.join(path, '.')] = value
  })
  const addKeepAlive: (a: string) => void = jest.fn()
  const removeKeepAlive: (a: string) => void = jest.fn()

  const commands = allFormRenderCommands(sectionContents, {}, [], flatRecord)
  const elements = _.map(commands, command =>
    React.cloneElement(
      renderCommand(command, setRecordPath, addKeepAlive, removeKeepAlive) || (
        <></>
      ),
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
    flatRecord,
    setRecordPath,
    commands,
    elements,
  }
}

export function expectSchemaToValidate(schema: any, data: any) {
  const ajv = addFormats(new Ajv())
  const dataProcessed = JSON.parse(JSON.stringify(data))
  const valid = ajv.validate(schema, dataProcessed)
  if (!valid) {
    console.error(
      betterAjvErrors(schema, dataProcessed, ajv.errors || [], {
        format: 'cli',
        indent: 2,
      })
    )
  }
  expect(valid).toBe(true)
}

export async function formFieldTest({
  sectionContents,
  nrOfCommands = 0,
  nrOfElements = 0,
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
  events?: (
    | { type: 'fire'; label: string }
    | { type: 'text'; label: string; value: string }
  )[]
  expectedSetCalls?: { path: RecordValuePath; value: RecordValue }[]
  debugTest?: boolean
  debugTestAfterFire?: boolean
  debugRecord?: boolean
  waitforMs?: boolean
}) {
  const {
    debug,
    getAllByA11yLabel,
    flatRecord,
    setRecordPath,
    commands,
    elements,
  } = formSectionRenderTest(sectionContents)

  if (debugTest) {
    debug(expect.getState().currentTestName)
  }

  expect(commands).toHaveLength(nrOfCommands)
  expect(elements).toHaveLength(nrOfElements)

  _.map(events, event => {
    if (event.type === 'fire')
      fireEvent.press(getAllByA11yLabel(event.label)[0])
    if (event.type === 'text')
      fireEvent.changeText(getAllByA11yLabel(event.label)[0], event.value)
  })

  if (waitforMs) {
    await waitFor(() =>
      expect(setRecordPath).toHaveBeenCalledTimes(expectedSetCalls.length)
    )
  }

  if (debugTestAfterFire) {
    debug(expect.getState().currentTestName)
  }

  expect(setRecordPath).toHaveBeenCalledTimes(expectedSetCalls.length)
  _.map(expectedSetCalls, (call, nr) =>
    expect(setRecordPath).toHaveBeenNthCalledWith(nr + 1, call.path, call.value)
  )
  const record = flatRecordToRecordType(flatRecord)
  if (debugRecord) {
    console.log('Record', JSON.stringify(record, null, 2))
  }
}
