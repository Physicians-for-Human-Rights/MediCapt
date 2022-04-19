import {
  FormPart,
  FormPartField,
  FormPartMap,
  FormSection,
  NonRefFormPart,
} from 'utils/types/form'
import { FormMetadata } from 'utils/types/formMetadata'
import { RecordValuePath } from 'utils/types/record'

// Sections and fields are named by the key of the object they're stored in. The
// name is not present inside the section or field.

export type FormsMetadata = Record<string, FormMetadata>

export type Named<T> = T & { name: string }
export type NamedFormSection = Named<FormSection>
export type NamedFormPart = Named<FormPart>

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

export type StandardFormFn<Return, RestrictPart = {}> = (
  // The path to the current value. We can be called multiple times with
  // different value paths when items are repeated
  valuePath: RecordValuePath,
  // The part that corresponds to that entry (an entry is a named part)
  part: NonRefFormPart & (FormPartField & RestrictPart),
  // The path in the form to the current item
  recordPath: RecordValuePath,
  // The index within a list if we're contained in one. Zero otherwise
  index: number,
  // The entry in the form that we're processing
  entry: FormPartMap
) => Return

// export type SelectMultipleFormFn<Return> = (
//   recordValuePath: RecordValuePath,
//   part: FormPart,
//   recordPath: RecordValuePath,
//   index: number,
//   formPartMap: FormPartMap
// ) => Return

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

export type FieldTypes =
  | 'address'
  | 'body-image'
  | 'bool'
  | 'date'
  | 'date-time'
  | 'email'
  | 'gender'
  | 'list'
  | 'list-multiple'
  | 'list-with-labels'
  | 'list-with-labels-multiple'
  | 'list-with-parts'
  | 'long-text'
  | 'number'
  | 'phone-number'
  | 'photo'
  | 'sex'
  | 'signature'
  | 'text'

// A type to support walking over a form
export type FormFns<Return> = {
  // utilities
  combineResultsFromParts: (
    results: Return[],
    // This combination of parts doesn't know what its enclosing form type is
    partsListRecordPath: RecordValuePath,
    index: number
  ) => Return
  combineResultsFromSubparts: (
    results: Return[],
    parentPart: FormPart,
    inner: Return | null,
    // The path to the parts and the parts we should combine together
    parentPartRecordPath: RecordValuePath,
    // This part combination can know what its enclosing form type is
    index: number,
    entry: FormPartMap
  ) => Return
  pre: (
    part: FormPart,
    recordPath: RecordValuePath,
    index: number,
    formPartMap: FormPartMap,
    partOptional: boolean
  ) => Return | null
  post: (
    part: FormPart,
    // The subparts are already combined
    subparts: Return | null,
    inner: Return | null,
    recordPath: RecordValuePath,
    index: number,
    pre: Return | null,
    formPartMap: FormPartMap,
    partOptional: boolean
  ) => Return
  // Handle repeats
  preEachRepeat: (
    part: FormPart,
    repeatListRecordPath: RecordValuePath,
    repeatId: string,
    recordPath: RecordValuePath
  ) => void
  eachRepeat: (
    result: Return,
    part: FormPart,
    repeatListRecordPath: RecordValuePath,
    repeatId: ArrayElement<RecordValuePath>,
    recordPath: RecordValuePath
  ) => Return
  preRepeat: (part: FormPart, repeatListRecordPath: RecordValuePath) => void
  postRepeated: (
    resultMaps: { path: RecordValuePath; result: Return }[],
    part: FormPart,
    repeatListRecordPath: RecordValuePath
  ) => Return
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
  email: StandardFormFn<Return, { type: 'email' }>
  list: StandardFormFn<Return, { type: 'list' }>
  'list-with-labels': StandardFormFn<Return, { type: 'list-with-labels' }>
  'list-multiple': StandardFormFn<Return, { type: 'list-multiple' }>
  // 'list-multiple': SelectMultipleFormFn<Return>
  'list-with-labels-multiple': StandardFormFn<
    Return,
    { type: 'list-with-labels-multiple' }
  >
  // 'list-with-labels-multiple': SelectMultipleFormFn<Return>
  'list-with-parts': StandardFormFn<Return, { type: 'list-with-parts' }>
  // 'list-with-parts': SelectMultipleFormFn<Return>
  'long-text': StandardFormFn<Return, { type: 'long-text' }>
  number: StandardFormFn<Return, { type: 'number' }>
  'phone-number': StandardFormFn<Return, { type: 'phone-number' }>
  photo: StandardFormFn<Return, { type: 'photo' }>
  sex: StandardFormFn<Return, { type: 'sex' }>
  signature: StandardFormFn<Return, { type: 'signature' }>
  text: StandardFormFn<Return, { type: 'text' }>
}
