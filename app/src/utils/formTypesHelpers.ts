import {
  FormMetadata,
  FormPart,
  FormPartField,
  FormPartRecord,
  FormPath,
  FormSection,
  NonRefFormPart,
} from 'utils/formTypes'

// Sections and fields are named by the key of the object they're stored in. The
// name is not present inside the section or field.

export type FormsMetadata = Record<string, FormMetadata>

export type Named<T> = T & { name: string }
export type NamedFormSection = Named<FormSection>
export type NamedFormPart = Named<FormPart>

export type StandardFormFn<Return, RestrictPart = {}> = (
  // The path to the current value. We can be called multiple times with
  // different value paths when items are repeated
  valuePath: FormPath,
  // The part that corresponds to that entry (an entry is a named part)
  part: NonRefFormPart & (FormPartField & RestrictPart),
  // The path in the form to the current item
  formPath: FormPath,
  // The index within a list if we're contained in one. Zero otherwise
  index: number,
  // The entry in the form that we're processing
  entry: FormPartRecord
) => Return

export type FieldType = {
  signature: string // data URI
  'body-image': any // TODO
  bool: boolean
  gender: string
  text: string
  'long-text': string
  number: number
  address: number
  'phone-number': number
  date: Date // local TZ - need to convert before sending to remote machine
  'date-time': Date // local TZ - need to convert before sending to remote machine
  'list-with-parts': string // TODO
  list: string // TODO
  sex: string
  photo: string // data URI
  'list-with-labels': string // TODO
  // an escape hatch
  any: any
  // this will cause type errors if nothing is specified
  unknown: unknown
}

// A type to support walking over a form
export type FormFns<Return> = {
  // utilities
  pre: (
    part: FormPart,
    formPath: FormPath,
    index: number,
    entry: FormPartRecord
  ) => Return | null
  post: (
    part: FormPart,
    // The subparts are already combined
    subparts: Return | null,
    inner: Return | null,
    formPath: FormPath,
    index: number,
    pre: Return | null,
    skippedPath: string | null,
    entry: FormPartRecord
  ) => Return
  combinePlainParts: (
    subparts: Return[],
    // This combination of parts doesn't know what its enclosing form type is
    formPath: FormPath,
    index: number
  ) => Return
  combineSmartParts: (
    part: FormPart,
    subparts: Return[],
    inner: Return | null,
    // The path to the parts and the parts we should combine together
    formPath: FormPath,
    // This part combination can know what its enclosing form type is
    index: number,
    entry: FormPartRecord
  ) => Return
  selectMultiple: (
    valuePaths: string[],
    part: FormPart,
    formPath: FormPath,
    index: number,
    otherPath: FormPath | null,
    entry: FormPartRecord
  ) => Return | null
  // parts
  //
  // The type restrictions here allow for cleaner code that knows which
  // properties are available to which part types
  address: StandardFormFn<Return, { type: 'address' }>
  'body-image': StandardFormFn<Return, { type: 'body-image' }>
  bool: StandardFormFn<Return, { type: 'bool' }>
  date: StandardFormFn<Return, { type: 'date' }>
  'date-time': StandardFormFn<Return, { type: 'date-time' }>
  gender: StandardFormFn<Return, { type: 'gender' }>
  list: StandardFormFn<Return, { type: 'list' }>
  'list-with-labels': StandardFormFn<Return, { type: 'list-with-labels' }>
  'list-with-parts': StandardFormFn<Return, { type: 'list-with-parts' }>
  'long-text': StandardFormFn<Return, { type: 'long-text' }>
  number: StandardFormFn<Return, { type: 'number' }>
  'phone-number': StandardFormFn<Return, { type: 'phone-number' }>
  photo: StandardFormFn<Return, { type: 'photo' }>
  sex: StandardFormFn<Return, { type: 'sex' }>
  signature: StandardFormFn<Return, { type: 'signature' }>
  text: StandardFormFn<Return, { type: 'text' }>
}
