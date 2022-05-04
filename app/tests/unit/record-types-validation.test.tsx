import { formFieldTest } from './utils'
import fs from 'fs'
import yaml from 'js-yaml'
import _ from 'lodash'

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

  it('A list-multiple field', async () => {
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
      events: [
        { type: 'fire', label: 'form.select-the-option OptionA' },
        { type: 'fire', label: 'form.select-the-option OptionC' },
      ],
      waitforMs: true,
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart'],
          value: {
            type: 'list-multiple',
            value: {
              options: ['OptionA', 'OptionB', 'OptionC'],
              selections: [true, false, false],
            },
          },
        },
        // TODO updated record value is only recieved by list-multiple element
        // on re-render, so on tests the element will get the outdated record value
        {
          path: ['sections', 'test', 'parts', 'mypart'],
          value: {
            type: 'list-multiple',
            value: {
              options: ['OptionA', 'OptionB', 'OptionC'],
              selections: [false, false, true],
            },
          },
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
      events: [{ type: 'fire', label: 'form.add-photo' }],
      waitforMs: true,
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart'],
          value: {
            type: 'photo',
            value: [
              {
                'date-taken': expect.any(Date),
                uri: 'data:image/jpeg;base64,MOCK',
              },
            ],
          },
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
      events: [{ type: 'fire', label: 'button sex.Male' }],
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart'],
          value: {
            type: 'sex',
            value: 'male',
          },
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
          path: ['sections', 'test', 'parts', 'mypart'],
          value: {
            type: 'address',
            value: '22 Road st.',
          },
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
          path: ['sections', 'test', 'parts', 'mypart'],
          value: {
            type: 'phone-number',
            value: '+1-333-222-1111',
          },
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
      events: [{ type: 'text', label: 'form.enter-text', value: 'mytext' }],
      waitforMs: true,
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart'],
          value: {
            type: 'text',
            value: 'mytext',
          },
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
      events: [
        { type: 'text', label: 'form.enter-long-text', value: 'mytext' },
      ],
      waitforMs: true,
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart'],
          value: {
            type: 'long-text',
            value: 'mytext',
          },
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
      events: [
        { type: 'text', label: 'form.enter-email', value: 'test@test.test' },
      ],
      waitforMs: true,
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart'],
          value: {
            type: 'email',
            value: 'test@test.test',
          },
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
      events: [{ type: 'text', label: 'form.enter-number', value: '23' }],
      waitforMs: true,
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart'],
          value: {
            type: 'number',
            value: '23',
          },
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
      events: [
        { type: 'fire', label: 'form.enter-date-time' },
        { type: 'fire', label: 'Confirm' },
      ],
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart'],
          value: {
            type: 'date-time',
            value: expect.any(Date),
          },
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
      events: [
        { type: 'fire', label: 'form.enter-date' },
        { type: 'fire', label: 'Confirm' },
      ],
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart'],
          value: {
            type: 'date',
            value: expect.any(Date),
          },
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
      events: [{ type: 'fire', label: 'button form.Yes' }],
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart'],
          value: {
            type: 'bool',
            value: true,
          },
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
      events: [{ type: 'fire', label: 'button gender.Female' }],
      expectedSetCalls: [
        {
          path: ['sections', 'test', 'parts', 'mypart'],
          value: {
            type: 'gender',
            value: 'female',
          },
        },
      ],
    })
  })
})
