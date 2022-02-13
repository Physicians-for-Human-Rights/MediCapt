import fs from 'fs'
import yaml from 'js-yaml'
import { FormType } from 'utils/formTypes'
import _ from 'lodash'
import { nameFormSections, isSectionComplete } from 'utils/forms'

const form: FormType = yaml.load(
  fs.readFileSync('assets/forms/ke-moh-363-2019/form.yaml', 'utf8')
) as FormType

describe('Basic operations on forms', () => {
  it('Loading forms', () => {
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
