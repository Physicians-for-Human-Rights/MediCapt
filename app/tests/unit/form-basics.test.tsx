import { Platform } from 'react-native'
import fs from 'fs'
import yaml from 'js-yaml'
import {
  FormSection,
  FormValueType,
  FormType,
  FormPath,
  FormPart,
  FormMetadata,
  FormPartRecord,
  FormDefinition,
  FormRef,
} from 'utils/formTypes'
import { FormsMetadata } from 'utils/formTypesHelpers'
import { loadForm } from 'utils/forms'
import _ from 'lodash'
import { mapSectionWithPaths, isSectionComplete } from 'utils/forms'
import { nameFormSections } from 'utils/forms'

const form: FormType = yaml.load(
  fs.readFileSync('assets/forms/ke-moh-363-2019/form.yaml', 'utf8')
) as FormType

describe('Basic operations on forms', () => {
  it('Loading forms', async () => {
    const { common } = form
    const sections = nameFormSections(form.sections)
    expect(
      _.reduce(
        _.map(sections, section =>
          isSectionComplete(section, form.common, () => undefined)
        ),
        (a, b) => a && b
      )
    ).toBe(false)
  })
})
