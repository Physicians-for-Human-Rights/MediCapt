import { formFieldTest } from './utils'
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

const form = yaml.load(
  fs.readFileSync('assets/forms/ke-moh-363-2019/form.yaml', 'utf8')
)
const formProcessed = JSON.parse(JSON.stringify(form))

describe('Record typescript definition', () => {
  it('The empty form is empty', async () => {
    await formFieldTest({
      sectionContents: {
        name: 'test',
        title: 'Test',
        parts: [],
      },
    })
  })

  // TODO List of commands to test
  ///////////////////
  // add-repeat-button
  // remove-repeat-button
  // title
  // body-image
  // description
  // list
  // list-with-labels
  // list-with-labels-multiple
  // list-with-parts
  // row
  // row-with-description
  // signature

  // TODO List of form elements to test
  ///////////////////
  // signature
  // list
  // list-with-labels
  // list-with-labels-multiple
  // list-with-parts
  // body-image
  // subparts

  it('A list field', async () => {
    // TODO Test other
    await formFieldTest({
      sectionContents: {
        name: 'test',
        title: 'Test',
        parts: [
          {
            mypart: {
              title: 'Title!',
              type: 'list-multiple',
              options: ['OptionA', 'OptionB', 'OptionC'],
            },
          },
        ],
      },
      nrOfCommands: 3,
      nrOfElements: 3,
      expectedGetCalls: [
        {
          path: [
            'sections',
            'test',
            'parts',
            'mypart',
            'list-multiple',
            'value',
            0,
          ],
          defaultValue: false,
        },
        {
          path: [
            'sections',
            'test',
            'parts',
            'mypart',
            'list-multiple',
            'value',
            1,
          ],
          defaultValue: false,
        },
        {
          path: [
            'sections',
            'test',
            'parts',
            'mypart',
            'list-multiple',
            'value',
            2,
          ],
          defaultValue: false,
        },
      ],
      events: [
        { type: 'fire', label: 'form.select-the-option OptionA' },
        { type: 'fire', label: 'form.select-the-option OptionC' },
      ],
      waitforMs: true,
      expectedSetCalls: [
        {
          path: [
            'sections',
            'test',
            'parts',
            'mypart',
            'list-multiple',
            'value',
            0,
          ],
          value: true,
        },
        {
          path: [
            'sections',
            'test',
            'parts',
            'mypart',
            'list-multiple',
            'value',
            2,
          ],
          value: true,
        },
      ],
    })
  })

  it('A photo field (adding a photo)', async () => {
    // TODO Test deleting a photo
    await formFieldTest({
      sectionContents: {
        name: 'test',
        title: 'Test',
        parts: [
          {
            mypart: {
              title: 'Title!',
              type: 'photo',
              'needs-consent': false,
            },
          },
        ],
      },
      nrOfCommands: 3,
      nrOfElements: 3,
      expectedGetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'photo', 'value'],
          defaultValue: [],
        },
      ],
      events: [{ type: 'fire', label: 'form.add-photo' }],
      waitforMs: true,
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'photo', 'value'],
          value: [
            {
              'date-taken': expect.any(Date),
              uri: 'data:image/jpeg;base64,MOCK',
            },
          ],
        },
      ],
    })
  })

  it('A sex field', async () => {
    await formFieldTest({
      sectionContents: {
        name: 'test',
        title: 'Test',
        parts: [
          {
            mypart: {
              title: 'Title!',
              type: 'sex',
            },
          },
        ],
      },
      nrOfCommands: 3,
      nrOfElements: 3,
      expectedGetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'sex', 'value'],
          defaultValue: '',
        },
      ],
      events: [{ type: 'fire', label: 'button sex.Male' }],
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'sex', 'value'],
          value: 'male',
        },
      ],
    })
  })

  it('An address field', async () => {
    await formFieldTest({
      sectionContents: {
        name: 'test',
        title: 'Test',
        parts: [
          {
            mypart: {
              title: 'Title!',
              type: 'address',
            },
          },
        ],
      },
      nrOfCommands: 3,
      nrOfElements: 3,
      expectedGetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'address', 'value'],
          defaultValue: '',
        },
      ],
      events: [
        {
          type: 'text',
          label: 'form.enter-address',
          value: '22 Road st.',
        },
      ],
      waitforMs: true,
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'address', 'value'],
          value: '22 Road st.',
        },
      ],
    })
  })

  it('A phone-number field', async () => {
    await formFieldTest({
      sectionContents: {
        name: 'test',
        title: 'Test',
        parts: [
          {
            mypart: {
              title: 'Title!',
              type: 'phone-number',
            },
          },
        ],
      },
      nrOfCommands: 3,
      nrOfElements: 3,
      expectedGetCalls: [
        {
          path: [
            'sections',
            'test',
            'parts',
            'mypart',
            'phone-number',
            'value',
          ],
          defaultValue: '',
        },
      ],
      events: [
        {
          type: 'text',
          label: 'form.enter-phone-number',
          value: '+1-333-222-1111',
        },
      ],
      waitforMs: true,
      expectedSetCalls: [
        {
          path: [
            'sections',
            'test',
            'parts',
            'mypart',
            'phone-number',
            'value',
          ],
          value: '+1-333-222-1111',
        },
      ],
    })
  })

  it('A text field', async () => {
    await formFieldTest({
      sectionContents: {
        name: 'test',
        title: 'Test',
        parts: [
          {
            mypart: {
              title: 'Title!',
              type: 'text',
            },
          },
        ],
      },
      nrOfCommands: 3,
      nrOfElements: 3,
      expectedGetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'text', 'value'],
          defaultValue: '',
        },
      ],
      events: [{ type: 'text', label: 'form.enter-text', value: 'mytext' }],
      waitforMs: true,
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'text', 'value'],
          value: 'mytext',
        },
      ],
    })
  })

  it('A long text field', async () => {
    await formFieldTest({
      sectionContents: {
        name: 'test',
        title: 'Test',
        parts: [
          {
            mypart: {
              title: 'Title!',
              type: 'long-text',
            },
          },
        ],
      },
      nrOfCommands: 3,
      nrOfElements: 3,
      expectedGetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'long-text', 'value'],
          defaultValue: '',
        },
      ],
      events: [
        { type: 'text', label: 'form.enter-long-text', value: 'mytext' },
      ],
      waitforMs: true,
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'long-text', 'value'],
          value: 'mytext',
        },
      ],
    })
  })

  it('An email field', async () => {
    await formFieldTest({
      sectionContents: {
        name: 'test',
        title: 'Test',
        parts: [
          {
            mypart: {
              title: 'Title!',
              type: 'email',
            },
          },
        ],
      },
      nrOfCommands: 3,
      nrOfElements: 3,
      expectedGetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'email', 'value'],
          defaultValue: '',
        },
      ],
      events: [
        { type: 'text', label: 'form.enter-email', value: 'test@test.test' },
      ],
      waitforMs: true,
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'email', 'value'],
          value: 'test@test.test',
        },
      ],
    })
  })

  it('A number field', async () => {
    await formFieldTest({
      sectionContents: {
        name: 'test',
        title: 'Test',
        parts: [
          {
            mypart: {
              title: 'Title!',
              type: 'number',
            },
          },
        ],
      },
      nrOfCommands: 3,
      nrOfElements: 3,
      expectedGetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'number', 'value'],
          defaultValue: '',
        },
      ],
      events: [{ type: 'text', label: 'form.enter-number', value: '23' }],
      waitforMs: true,
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'number', 'value'],
          value: '23',
        },
      ],
    })
  })

  it('A date-time field', async () => {
    await formFieldTest({
      sectionContents: {
        name: 'test',
        title: 'Test',
        parts: [
          {
            mypart: {
              title: 'Title!',
              type: 'date-time',
            },
          },
        ],
      },
      nrOfCommands: 3,
      nrOfElements: 3,
      expectedGetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'date-time', 'value'],
          defaultValue: null,
        },
      ],
      events: [
        { type: 'fire', label: 'form.enter-date-time' },
        { type: 'fire', label: 'Confirm' },
      ],
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'date-time', 'value'],
          value: expect.any(Date),
        },
      ],
    })
  })

  it('A date field', async () => {
    await formFieldTest({
      sectionContents: {
        name: 'test',
        title: 'Test',
        parts: [
          {
            mypart: {
              title: 'Title!',
              type: 'date',
            },
          },
        ],
      },
      nrOfCommands: 3,
      nrOfElements: 3,
      expectedGetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'date', 'value'],
          defaultValue: null,
        },
      ],
      events: [
        { type: 'fire', label: 'form.enter-date' },
        { type: 'fire', label: 'Confirm' },
      ],
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'date', 'value'],
          value: expect.any(Date),
        },
      ],
    })
  })

  it('A bool field', async () => {
    await formFieldTest({
      sectionContents: {
        name: 'test',
        title: 'Test',
        parts: [
          {
            mypart: {
              title: 'Title!',
              type: 'bool',
            },
          },
        ],
      },
      nrOfCommands: 3,
      nrOfElements: 3,
      expectedGetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'bool', 'value'],
          defaultValue: null,
        },
      ],
      events: [{ type: 'fire', label: 'button form.Yes' }],
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'bool', 'value'],
          value: true,
        },
      ],
    })
  })

  it('A gender field', async () => {
    await formFieldTest({
      sectionContents: {
        name: 'test',
        title: 'Test',
        parts: [
          {
            mypart: {
              title: 'Title!',
              type: 'gender',
            },
          },
        ],
      },
      nrOfCommands: 3,
      nrOfElements: 3,
      expectedGetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'gender', 'value'],
          defaultValue: '',
        },
      ],
      events: [{ type: 'fire', label: 'button gender.Female' }],
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart', 'gender', 'value'],
          value: 'female',
        },
      ],
    })
  })
})
