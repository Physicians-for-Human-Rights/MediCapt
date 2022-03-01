import { Platform } from 'react-native'
import * as FileSystem from 'expo-file-system'
import _ from 'lodash'
import { Asset } from 'expo-asset'
import {
  FormValueType,
  FormPart,
  FormSectionMap,
  FormPartMap,
  FormDefinition,
  FormRef,
  FormConditional,
} from 'utils/formTypes'
import { NamedFormSection, FormFns } from 'utils/formTypesHelpers'
import { RecordPath } from 'utils/recordTypes'

export function plainToFlattenObject(object: any) {
  const result: Record<string, FormValueType> = {}
  function flatten(obj: any, prefix = '') {
    _.forEach(obj, (value, key) => {
      if (_.isObject(value)) {
        flatten(value, `${prefix}${key}.`)
      } else {
        result[`${prefix}${key}`] = value
      }
    })
  }
  flatten(object)
  return result
}

export function objectPaths(object: any) {
  const result: Array<string> = []
  function flatten(obj: any, prefix = '') {
    _.forEach(obj, (value, key) => {
      if (_.isObject(value)) {
        flatten(value, `${prefix}${key}.`)
      } else {
        result.push(`${prefix}${key}`)
      }
    })
  }
  flatten(object)
  return result
}

export type GetValueFn = (
  path: RecordPath,
  _default?: any
) => FormPart | FormValueType | undefined

export function shouldSkipConditional(
  part: FormConditional,
  getValue: GetValueFn
) {
  if ('only-when' in part && part['only-when']) {
    if (
      getValue(_.split(part['only-when'].path, '.')) !== part['only-when'].value
    )
      return true
  }
  if ('only-not' in part && part['only-not']) {
    if (
      getValue(_.split(part['only-not'].path, '.')) === part['only-not'].value
    )
      return true
  }
  if ('only-sex' in part) {
    const sex = getValue(['inferred', 'sex'])
    switch (part['only-sex']) {
      case 'male':
        if (sex === 'female') return true
        break
      case 'female':
        if (sex === 'male') {
          return true
        }
        break
      case 'intersex':
        // This isn't a typo. If the part is for M, we don't show it to F. If the
        // part is for F, we don't show to M. If the fiels is for I, we only show
        // it for I. This fails open, I sees both M and F parts.
        if (sex !== 'intersex') return true
        break
    }
  }
  if ('only-gender' in part) {
    if (getValue(['inferred', 'gender']) !== part['only-gender']) return true
  }
  if ('only-child' in part) {
    const aom = getValue(['inferred', 'age-of-majority'])
    const age = getValue(['inferred', 'age'])
    if (typeof aom === 'number' && typeof age === 'number' && aom >= age)
      return true
  }
  return false
}

export function lookupPartRef(
  obj: FormRef,
  commonRefTable: Record<string, FormDefinition>
): Array<FormPartMap> {
  // @ts-ignore TODO We need to do error checking here
  return commonRefTable[obj.Ref]
}

export function resolveRef<T>(
  maybeRef: T | FormRef,
  commonRefTable: Record<string, FormDefinition>
): T | null {
  if (maybeRef && 'Ref' in maybeRef) {
    if (commonRefTable && maybeRef.Ref in commonRefTable)
      // @ts-ignore TODO How do narrow T so that it is part of FormDefinition?
      return commonRefTable[maybeRef.Ref]
    // TODO Error handling
    console.log('Could not resolve reference', maybeRef.Ref)
    return null
  }
  return maybeRef
}

export function mapSectionWithPaths<Return>(
  section: NamedFormSection,
  commonRefTable: Record<string, FormDefinition>,
  identity: Return,
  getValue: GetValueFn,
  fns: FormFns<Return>
): Return {
  function processMultiple(
    entry: Array<FormPartMap>,
    recordPath: RecordPath
  ): Return[] {
    if (_.isNil(entry)) return []
    return entry.map((e, i) => {
      return process(e, i, recordPath)
    })
  }
  function handleOne(
    part: FormPart,
    recordPath: RecordPath,
    index: number,
    entry: FormPartMap
  ): Return {
    const pre = fns.pre(part, recordPath, index, entry)
    let inner: Return | null = null
    let subparts: Return | null = null
    // References are always to a list of pats.
    if ('Ref' in part) {
      subparts = fns.combineSmartParts(
        part,
        processMultiple(lookupPartRef(part, commonRefTable), recordPath),
        null,
        recordPath,
        index,
        entry
      )
    } else {
      if ('type' in part) {
        // These parts have subparts that must be combined together
        switch (part.type) {
          case 'bool':
            if (
              'show-parts-when-true' in part &&
              part['show-parts-when-true'] &&
              getValue(recordPath.concat('value'))
            ) {
              subparts = fns.combineSmartParts(
                part,
                processMultiple(
                  part['show-parts-when-true'],
                  recordPath.concat('parts')
                ),
                inner,
                recordPath,
                index,
                entry
              )
            }
            break
        }
        // Some parts handle lists of results, all others handle single items
        switch (part.type) {
          case 'list-multiple':
          case 'list-with-labels-multiple':
            {
              const resolved = resolveRef(part.options, commonRefTable)
              if (resolved) {
                inner = fns.selectMultiple(
                  resolved.map((_e: any, i: number) => {
                    return recordPath.concat('value', i)
                  }),
                  part,
                  recordPath,
                  index,
                  part.other ? recordPath.concat('value', 'other') : null,
                  entry
                )
              }
            }
            break
          case 'list-with-parts': {
            const resolved = resolveRef(part.options, commonRefTable)
            if (resolved) {
              inner = fns.selectMultiple(
                resolved.map((_e: any, i: number) => {
                  return recordPath.concat('value', i)
                }),
                part,
                recordPath,
                index,
                null,
                entry
              )
              subparts = fns.combineSmartParts(
                part,
                processMultiple(
                  _.filter(
                    resolved.map((_e: any, i: number) => {
                      if (getValue(recordPath.concat('value', i), false)) {
                        return part.options[i]
                      } else {
                        return null
                      }
                    }),
                    p => p
                  ),
                  recordPath.concat('list-with-parts')
                ),
                inner,
                recordPath,
                index,
                entry
              )
            }
          }
          default:
            // @ts-ignore TODO Errors out with expression produces a union type that is too complex to represent
            if (part && fns[part.type]) {
              // @ts-ignore TODO Typescript doesn't seem willing to represent this type
              inner = fns[part.type](
                recordPath.concat('value'),
                part,
                recordPath,
                index,
                entry
              )
            } else {
              console.log('UNSUPPORTED FIELD TYPE', part)
            }
        }
      }
      if ('parts' in part && part.parts && part.parts !== undefined) {
        const parts = resolveRef(part.parts, commonRefTable)
        if (parts) {
          subparts = fns.combineSmartParts(
            part,
            _.concat(
              processMultiple(parts, recordPath.concat('parts')),
              subparts || []
            ),
            inner,
            recordPath,
            index,
            entry
          )
        }
      }
    }
    const skippedPath =
      'optional' in part && part.optional ? recordPath.concat('skipped') : null
    return fns.post(
      part,
      subparts,
      inner,
      recordPath,
      index,
      pre,
      skippedPath,
      entry
    )
  }
  function handleRepeats(
    repeated: true | 'at-least-one',
    part: FormPart,
    recordPath: RecordPath,
    index: number,
    entry: FormPartMap,
    repeats: string[]
  ): Return {
    fns.preRepeat(part, recordPath)
    return fns.postRepeated(
      _.filter(
        _.map(
          _.uniq(
            repeated === 'at-least-one'
              ? repeats.concat('at-least-one')
              : repeats
          ),
          r => {
            const path = recordPath.concat(['repeat', r])
            fns.preEachRepeat(part, recordPath, r, path)
            return {
              path,
              result: fns.eachRepeat(
                handleOne(part, path, index, entry),
                part,
                recordPath,
                path
              ),
            }
          }
        ),
        x => x.result !== null && x.result !== undefined
      ),
      part,
      recordPath
    )
  }
  function process(
    entry: FormPartMap,
    index: number,
    oldRecordPath: RecordPath
  ): Return {
    if (_.isNil(entry)) return identity
    const part = Object.values(entry)[0]
    if (
      !_.isObject(part) ||
      !_.isString(Object.keys(entry)[0]) ||
      Object.keys(entry)[0] === ''
    )
      return identity
    const recordPath = _.concat(oldRecordPath, Object.keys(entry)[0])
    //
    if (!('Ref' in part) && shouldSkipConditional(part, getValue)) {
      return identity
    }
    //
    if ('repeated' in part && part.repeated) {
      return handleRepeats(
        part.repeated,
        part,
        recordPath,
        index,
        entry,
        (getValue(recordPath.concat('repeat-list')) || []) as string[]
      )
    } else {
      return handleOne(part, recordPath, index, entry)
    }
  }
  if (shouldSkipConditional(section, getValue)) {
    return identity
  }
  if (_.isNil(section) || _.isNil(section.parts) || _.isNil(section.name))
    return identity
  return fns.combinePlainParts(
    processMultiple(section.parts, ['sections', section.name]),
    ['sections', section.name],
    0
  )
}

export function isSectionComplete(
  section: NamedFormSection,
  commonRefTable: Record<string, FormDefinition>,
  getValue: GetValueFn
) {
  return mapSectionWithPaths<boolean>(section, commonRefTable, true, getValue, {
    pre: () => true,
    selectMultiple: valuePaths =>
      // NB This checks not that getValue exists, but that at least one of them is also true.
      _.some(valuePaths, x => getValue(x)),
    address: valuePath => getValue(valuePath) != null,
    'body-image': valuePath => getValue(valuePath) != null,
    bool: valuePath => getValue(valuePath) != null,
    date: valuePath => getValue(valuePath) != null,
    'date-time': valuePath => getValue(valuePath) != null,
    email: valuePath => getValue(valuePath) != null,
    gender: valuePath => getValue(valuePath) != null,
    list: valuePath => getValue(valuePath) != null,
    'list-with-labels': valuePath => getValue(valuePath) != null,
    'list-with-parts': valuePath => getValue(valuePath) != null,
    'long-text': valuePath => getValue(valuePath) != null,
    number: valuePath => getValue(valuePath) != null,
    'phone-number': valuePath => getValue(valuePath) != null,
    photo: valuePath => getValue(valuePath) != null,
    sex: valuePath => getValue(valuePath) != null,
    text: valuePath => getValue(valuePath) != null,
    signature: valuePath => getValue(valuePath) != null,
    combinePlainParts: (subparts, _recordPath, _index) =>
      _.reduce(subparts, (a, b) => a && b, true as boolean),
    combineSmartParts: (_part, parts) => {
      const r = _.reduce(parts, (a, b) => a && b)
      if (r === undefined) return true
      else return r
    },
    preRepeat: () => null,
    preEachRepeat: () => null,
    eachRepeat: result => result,
    postRepeated: list =>
      _.reduce(
        _.map(list, e => e.result),
        (a, b) => a && b,
        true as boolean
      ),
    post: (_part, subparts, inner, _recordPath, _index, _pre, skippedPath) => {
      return (
        (skippedPath && getValue(skippedPath) === true) ||
        ((inner === null ? true : inner) &&
          (subparts === null ? true : subparts))
      )
    },
  })
}

export function blobToBase64(blob: Blob): Promise<string | ArrayBuffer> {
  return new Promise((resolve, _) => {
    const reader = new FileReader()
    reader.onloadend = () => reader.result && resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

export async function readImage(
  uri: string,
  mimePrefix: string
): Promise<string | ArrayBuffer | null> {
  let content = null
  if (Platform.OS === 'web') {
    content = await fetch(uri)
    content = await content.blob()
    content = await blobToBase64(content)
  } else if (FileSystem.EncodingType) {
    content = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    content = mimePrefix + content
  } else {
    console.error('File reading failed', uri, mimePrefix)
  }
  return content
}

export function isImage(filename: string) {
  return (
    _.endsWith(filename, '.png') ||
    _.endsWith(filename, '.jpg') ||
    _.endsWith(filename, '.webp')
  )
}

export async function readFile(filename: string, virtualAsset: string) {
  let content = null as string | ArrayBuffer | null
  const f = Asset.fromModule(virtualAsset)
  await f.downloadAsync()
  if (!f.localUri)
    throw new Error("Asset couldn't be downloaded to a local uri" + filename)
  switch (filename.split('.').pop()) {
    case 'yaml':
      if (Platform.OS === 'web') {
        content = await (await fetch(f.localUri)).text()
      } else {
        content = await FileSystem.readAsStringAsync(f.localUri)
      }
      break
    case 'svg':
      content = await readImage(f.localUri, 'data:image/svg+xml;base64,')
      // TODO Error handling
      console.error(
        "SVG Support was removed because it doesn't work well on Android"
      )
      break
    case 'pdf':
      content = await readImage(f.localUri, 'data:application/pdf;base64,')
      if (content === null) {
        throw new Error("Can't load file")
      }
      if (_.isArrayBuffer(content)) {
        content = new TextDecoder().decode(content)
      }
      content = _.replace(
        content,
        'data:application/pdf; charset=utf-8;base64,',
        'data:application/pdf;base64,'
      )
      break
    case 'png':
      content = await readImage(f.localUri, 'data:image/png;base64,')
      break
    case 'jpg':
      content = await readImage(f.localUri, 'data:image/jpg;base64,')
      break
    default:
      // TODO Error handling
      console.error('Trying to read unknown file type', filename, f.localUri)
      content = await FileSystem.readAsStringAsync(f.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      })
  }
  // TODO Enable array buffers
  if (_.isArrayBuffer(content)) {
    content = new TextDecoder().decode(content)
  }
  return content
}

export function nameFormSections(
  sections: FormSectionMap[]
): NamedFormSection[] {
  return _.filter(sections, _.negate(_.isNil)).map(e => {
    return {
      name: Object.keys(e)[0],
      ...Object.values(e)[0],
    }
  })
}
