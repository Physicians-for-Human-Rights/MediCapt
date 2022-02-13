import { Platform } from 'react-native'
import * as FileSystem from 'expo-file-system'
import _ from 'lodash'
import { Asset } from 'expo-asset'
import yaml from 'js-yaml'
import allForms from 'allForms'
import {
  FormValueType,
  FormType,
  FormPath,
  FormPart,
  FormMetadata,
  FormSectionRecord,
  FormPartRecord,
  FormDefinition,
  FormRef,
  FormConditional,
} from 'utils/formTypes'
import { NamedFormSection, FormFns } from 'utils/formTypesHelpers'

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

export type GetValueFn = (path: string) => FormPart | FormValueType | undefined

export function shouldSkipConditional(
  part: FormConditional,
  getValue: GetValueFn
) {
  if ('only-when' in part && part['only-when']) {
    if (getValue(part['only-when'].path) !== part['only-when'].value)
      return true
  }
  if ('only-not' in part && part['only-not']) {
    if (getValue(part['only-not'].path) === part['only-not'].value) return true
  }
  if ('only-sex' in part) {
    const sex = getValue('inferred.sex')
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
    if (getValue('inferred.gender') !== part['only-gender']) return true
  }
  if ('only-child' in part) {
    const aom = getValue('inferred.age-of-majority')
    const age = getValue('inferred.age')
    if (typeof aom === 'number' && typeof age === 'number' && aom >= age)
      return true
  }
  return false
}

export function lookupPartRef(
  obj: FormRef,
  common: Record<string, FormDefinition>
): Array<FormPartRecord> {
  // @ts-ignore TODO We need to do error checking here
  return common[obj.Ref]
}

export function resolveRef<T>(
  maybeRef: T | FormRef,
  common: Record<string, FormDefinition>
): T {
  if ('Ref' in maybeRef) {
    // @ts-ignore TODO How do narrow T so that it is part of FormDefinition?
    return common[maybeRef.Ref]
  }
  return maybeRef
}

export function mapSectionWithPaths<Return>(
  section: NamedFormSection,
  common: Record<string, FormDefinition>,
  identity: Return,
  getValue: GetValueFn,
  fns: FormFns<Return>
): Return {
  function processMultiple(
    entry: Array<FormPartRecord>,
    index: number,
    formPath: FormPath
  ): Return[] {
    if (_.isNil(entry)) return []
    return entry.map((e, i) => {
      return process(e, i, formPath)
    })
  }
  function process(
    entry: FormPartRecord,
    index: number,
    oldFormPath: FormPath
  ): Return {
    if (_.isNil(entry)) return identity
    const part = Object.values(entry)[0]
    if (
      !_.isObject(part) ||
      !_.isString(Object.keys(entry)[0]) ||
      Object.keys(entry)[0] === ''
    )
      return identity
    const formPath = oldFormPath + '.' + Object.keys(entry)[0]
    let inner: Return | null = null
    let subparts: Return | null = null
    //
    if (!('Ref' in part) && shouldSkipConditional(part, getValue)) {
      return identity
    }
    //
    const pre = fns.pre(entry, part, index, formPath)
    //
    if ('Ref' in part) {
      subparts = fns.combineSmartParts(
        entry,
        part,
        index,
        null,
        formPath,
        processMultiple(lookupPartRef(part, common), index, formPath)
      )
    } else {
      if ('type' in part) {
        switch (part.type) {
          case 'bool':
            if (
              'show-parts-when-true' in part &&
              part['show-parts-when-true'] &&
              getValue(formPath + '.value')
            ) {
              subparts = fns.combineSmartParts(
                entry,
                part,
                index,
                inner,
                formPath,
                processMultiple(
                  part['show-parts-when-true'],
                  0,
                  formPath + '.parts'
                )
              )
            }
            break
          case 'list':
            if (part['select-multiple']) {
              inner = fns.selectMultiple(
                entry,
                part,
                index,
                formPath,
                resolveRef(part.options, common).map((_e: any, i: number) => {
                  return formPath + '.value.' + i
                }),
                part.other ? formPath + '.value.other' : null
              )
            }
            break
          case 'list-with-labels':
            if (part['select-multiple']) {
              inner = fns.selectMultiple(
                entry,
                part,
                index,
                formPath,
                resolveRef(part.options, common).map((_e: any, i: number) => {
                  return formPath + '.value.' + i
                }),
                part.other ? formPath + '.value.other' : null
              )
            }
            break
        }
        if (!inner) {
          // @ts-ignore TODO Errors out with expression produces a union type that is too complex to represent
          if (part && fns[part.type]) {
            inner = fns[part.type](
              entry,
              // @ts-ignore TODO Typescript doesn't seem willing to represent this type
              part,
              index,
              formPath,
              formPath + '.value'
            )
          } else {
            console.log('UNSUPPORTED FIELD TYPE', part)
          }
        }
      }
      if ('parts' in part && part.parts && part.parts !== undefined) {
        subparts = fns.combineSmartParts(
          entry,
          part,
          index,
          inner,
          formPath,
          _.concat(
            processMultiple(
              resolveRef(part.parts, common),
              0,
              formPath + '.parts'
            ),
            subparts || []
          )
        )
      }
    }
    //
    const skippedPath =
      'optional' in part && part.optional ? formPath + '.skipped' : null
    return fns.post(
      entry,
      part,
      index,
      formPath,
      pre,
      inner,
      subparts,
      skippedPath
    )
  }
  if (shouldSkipConditional(section, getValue)) {
    return identity
  }
  if (_.isNil(section) || _.isNil(section.parts) || _.isNil(section.name))
    return identity
  return fns.combinePlainParts(
    'sections.' + section.name,
    0,
    processMultiple(section.parts, 0, 'sections.' + section.name)
  )
}

export function allFormValuePathsForSection(
  section: NamedFormSection,
  common: Record<string, FormDefinition>,
  getValue: GetValueFn
) {
  let allValuePaths: string[] = []
  // any is an ok type here because we're discarding the output
  mapSectionWithPaths<any>(section, common, [], getValue, {
    pre: () => null,
    selectMultiple: (_entry, _obj, _index, _formPath, valuePaths) => {
      allValuePaths = allValuePaths.concat(valuePaths)
    },
    signature: (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    bool: (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    gender: (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    sex: (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    text: (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    'long-text': (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    number: (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    date: (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    'date-time': (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    list: (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    'list-with-labels': (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    'list-with-parts': (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    'phone-number': (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    address: (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    'body-image': (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    photo: (_entry, _obj, _index, _formPath, valuePath) =>
      allValuePaths.push(valuePath),
    combinePlainParts: (_formPath, _index, _subparts) => null,
    combineSmartParts: (
      _entry,
      _part,
      _index,
      _inner,
      // The path to the parts and the parts we should combine together
      _formPath
    ) => null,
    post: (_entry, _obj, _index, _formPath, _pre, _inner, _subparts) => null,
  })
  return allValuePaths
}

export function isSectionComplete(
  section: NamedFormSection,
  common: Record<string, FormDefinition>,
  getValue: GetValueFn
) {
  return mapSectionWithPaths<boolean>(section, common, true, getValue, {
    pre: () => true,
    selectMultiple: (_entry, _obj, _index, _formPath, valuePaths) =>
      // NB This checks not that getValue exists, but that at least one of them is also true.
      _.some(valuePaths, x => getValue(x)),
    signature: (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    bool: (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    gender: (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    sex: (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    text: (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    'long-text': (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    number: (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    date: (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    'date-time': (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    list: (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    'list-with-labels': (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    'list-with-parts': (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    'phone-number': (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    'body-image': (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    address: (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    photo: (_entry, _obj, _index, _formPath, valuePath) =>
      getValue(valuePath) != null,
    combinePlainParts: (_formPath, _index, subparts) =>
      _.reduce(subparts, (a, b) => a && b, true as boolean),
    combineSmartParts: (
      _entry,
      _part,
      _index,
      _inner,
      // The path to the parts and the parts we should combine together
      _formPath,
      parts
    ) => {
      const r = _.reduce(parts, (a, b) => a && b)
      if (r === undefined) return true
      else return false
    },
    post: (
      _entry,
      _obj,
      _index,
      _formPath,
      _pre,
      inner,
      subparts,
      skippedPath
    ) => {
      return (
        (skippedPath && getValue(skippedPath) === true) ||
        ((inner === null ? true : inner) &&
          (subparts === null ? true : subparts))
      )
    },
  })
}

export function blobToBase64(blob: Blob): string {
  return new Promise((resolve, _) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

export async function readImage(
  uri: string,
  mimePrefix: string
): Promise<string | null> {
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

export async function readFile(filename: string, localUri: string) {
  let content = null
  switch (filename.split('.').pop()) {
    case 'yaml':
      if (Platform.OS === 'web') {
        content = await fetch(localUri)
        content = await content.text()
      } else {
        content = await FileSystem.readAsStringAsync(localUri)
      }
      break
    case 'svg':
      content = await readImage(localUri, 'data:image/svg+xml;base64,')
      // TODO Error handling
      console.error(
        "SVG Support was removed because it doesn't work well on Android"
      )
      break
    case 'pdf':
      content = await readImage(localUri, 'data:application/pdf;base64,')
      content = _.replace(
        content,
        'data:application/pdf; charset=utf-8;base64,',
        'data:application/pdf;base64,'
      )
      break
    case 'png':
      content = await readImage(localUri, 'data:image/png;base64,')
      break
    case 'jpg':
      content = await readImage(localUri, 'data:image/jpg;base64,')
      break
    default:
      // TODO Error handling
      console.error('Trying to read unknown file type', filename, localUri)
      content = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      })
  }
  return content
}

// NB formInfo comes from forms.json rihgt now
export async function loadForm(formMetadata: FormMetadata) {
  // TODO Error handling
  const files = _.fromPairs(
    await Promise.all(
      _.toPairs<string>(allForms[formMetadata.path]).map(
        async (p: [string, string]) => {
          const filename = p[0]
          const f = Asset.fromModule(p[1])
          await f.downloadAsync()
          let content = null
          if (!f.localUri)
            throw new Error(
              "Asset couldn't be downloaded to a local uri" + p[1]
            )
          switch (filename.split('.').pop()) {
            case 'yaml':
              if (Platform.OS === 'web') {
                content = await fetch(f.localUri)
                content = await content.text()
              } else {
                content = await FileSystem.readAsStringAsync(f.localUri)
              }
              break
            case 'svg':
              content = await readImage(
                f.localUri,
                'data:image/svg+xml;base64,'
              )
              // TODO Error handling
              console.error(
                "SVG Support was removed because it doesn't work well on Android"
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
              console.error(
                'Trying to read unknown file type',
                filename,
                f.localUri
              )
              content = await FileSystem.readAsStringAsync(f.localUri, {
                encoding: FileSystem.EncodingType.Base64,
              })
          }
          return [filename, content]
        }
      )
    )
  )
  // @ts-ignore TODO need to have a typed loader
  const form: FormType = yaml.load(files['form.yaml'])
  return {
    files,
    form,
    formSections: nameFormSections(form.sections),
  }
}

export function nameFormSections(
  sections: FormSectionRecord[]
): NamedFormSection[] {
  return _.filter(sections, _.negate(_.isNil)).map(e => {
    return {
      name: Object.keys(e)[0],
      ...Object.values(e)[0],
    }
  })
}
