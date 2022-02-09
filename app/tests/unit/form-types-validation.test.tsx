import fs from 'fs'
import yaml from 'js-yaml'
import { createGenerator, Schema } from 'ts-json-schema-generator'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const schema = createGenerator({
  path: 'src/utils/formTypes.ts',
  tsconfig: 'tsconfig.dummy.json',
  type: '*',
}).createSchema('FormType')
const schemaProcessed = JSON.parse(JSON.stringify(schema))
const data = yaml.load(
  fs.readFileSync('assets/forms/ke-moh-363-2019/form.yaml', 'utf8')
)
const dataProcessed = JSON.parse(JSON.stringify(data))

describe('Form typescript definition', () => {
  it('The generated JSON schema is valid', () => {
    const ajv = addFormats(new Ajv())
    const valid = ajv.validateSchema(schemaProcessed)
    expect(valid).toBe(true)
    if (!valid) console.log(ajv.errors)
  })
  it('The KE form is valid', () => {
    const ajv = addFormats(new Ajv())
    const valid = ajv.validate(schemaProcessed, dataProcessed)
    expect(valid).toBe(true)
    if (!valid) console.log(ajv.errors)
  })
})
