import { Platform } from 'react-native'
import * as FileSystem from 'expo-file-system'
import _ from 'lodash'
import { Asset } from 'expo-asset'
import {
  FormPart,
  FormSectionMap,
  FormPartMap,
  FormDefinition,
  FormRef,
  FormConditional,
} from 'utils/types/form'
import { NamedFormSection, FormFns } from 'utils/types/formHelpers'
import { RecordValuePath, FlatRecord, RecordValue } from 'utils/types/record'
import { getFlatRecordValue } from './records'

// Conditionals are either sections or parts
export function shouldSkipConditional(
  conditional: FormConditional,
  flatRecord: FlatRecord
) {
  if ('only-when' in conditional && conditional['only-when']) {
    const condition = getFlatRecordValue(
      flatRecord,
      _.split(conditional['only-when'].path, '.')
    )
    if (
      !condition ||
      condition.type !== 'bool' ||
      condition.value !== conditional['only-when'].value
    )
      return true
  }
  if ('only-not' in conditional && conditional['only-not']) {
    const condition = getFlatRecordValue(
      flatRecord,
      _.split(conditional['only-not'].path, '.')
    )
    if (
      condition &&
      condition.type === 'bool' &&
      condition.value === conditional['only-not'].value
    )
      return true
  }
  if ('only-sex' in conditional) {
    const recordSex =
      getFlatRecordValue(flatRecord, ['inferred', 'sex'], 'sex') ||
      getFlatRecordValue(flatRecord, ['inferred', 'gender'], 'gender')
    switch (conditional['only-sex']) {
      case 'male':
        if (recordSex?.value === 'female') return true
        break
      case 'female':
        if (recordSex?.value === 'male') return true
        break
      case 'intersex':
        // This isn't a typo. If the part is for M, we don't show it to F. If the
        // part is for F, we don't show to M. If the fiels is for I, we only show
        // it for I. This fails open, I sees both M and F parts.
        if (recordSex?.value !== 'intersex') return true
        break
    }
  }
  if ('only-gender' in conditional) {
    const recordGender =
      getFlatRecordValue(flatRecord, ['inferred', 'gender'], 'gender') ||
      getFlatRecordValue(flatRecord, ['inferred', 'sex'], 'sex')
    if (recordGender?.value !== conditional['only-gender']) return true
  }
  if ('only-child' in conditional) {
    const aom = getFlatRecordValue(
      flatRecord,
      ['inferred', 'age-of-majority'],
      'number'
    )
    const age = getFlatRecordValue(flatRecord, ['inferred', 'age'], 'number')
    // TODO: fix string comparison
    if (aom && age && aom.value >= age.value) return true
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
  flatRecord: FlatRecord,
  fns: FormFns<Return>
): Return {
  // -------------------
  //  Helper Functions
  // -------------------

  // List of Return from a formPartsArray
  function handleFormPartsArray(
    formPartsArray: Array<FormPartMap>,
    partsRecordPath: RecordValuePath
  ): Return[] {
    if (_.isNil(formPartsArray)) return []

    // Handle each form part
    return formPartsArray.map((formPartMap, index) => {
      if (
        _.isNil(formPartMap) ||
        !_.isString(Object.keys(formPartMap)[0]) ||
        Object.keys(formPartMap)[0] === ''
      )
        return identity

      const formPart = Object.values(formPartMap)[0]
      const recordPath = _.concat(partsRecordPath, Object.keys(formPartMap)[0])

      if (!_.isObject(formPart)) return identity

      // If the part isn't a reference and should be skipped
      if (!('Ref' in formPart) && shouldSkipConditional(formPart, flatRecord)) {
        return identity
      }

      // We handle repeated parts separately
      if ('repeated' in formPart && formPart.repeated) {
        return handleRepeatedFormPart(
          formPart,
          recordPath,
          index,
          formPartMap,
          formPart.repeated
        )
      } else {
        return handleFormPart(formPart, recordPath, index, formPartMap)
      }
    })
  }

  function handleRepeatedFormPart(
    formPart: FormPart,
    repeatListRecordPath: RecordValuePath,
    index: number,
    formPartMap: FormPartMap,
    repeated: true | 'at-least-one'
  ): Return {
    const repeatList = _.uniq([
      ...(repeated === 'at-least-one' ? ['at-least-one'] : []),
      ...(getFlatRecordValue(flatRecord, repeatListRecordPath, 'repeat-list')
        ?.value || []),
    ])

    fns.preRepeat(formPart, repeatListRecordPath)

    const resultMaps = _.map(repeatList, repeatId => {
      const recordPath = repeatListRecordPath.concat(['repeat', repeatId])

      fns.preEachRepeat(formPart, repeatListRecordPath, repeatId, recordPath)
      const result = fns.eachRepeat(
        handleFormPart(formPart, recordPath, index, formPartMap),
        formPart,
        repeatListRecordPath,
        repeatId,
        recordPath
      )

      return { path: recordPath, result }
    })

    return fns.postRepeated(
      _.filter(
        resultMaps,
        map => map.result !== null && map.result !== undefined
      ),
      formPart,
      repeatListRecordPath
    )
  }

  function handleFormPart(
    part: FormPart,
    recordPath: RecordValuePath,
    index: number,
    formPartMap: FormPartMap
  ): Return {
    const partOptional = ('optional' in part && part.optional) || false

    const pre = fns.pre(part, recordPath, index, formPartMap, partOptional)

    let resultFromValue: Return | null = null
    let resultsFromSubparts: Return[] = []
    // References are always to a list of parts.
    if ('Ref' in part) {
      resultsFromSubparts = handleFormPartsArray(
        lookupPartRef(part, commonRefTable),
        recordPath
      )
    } else {
      if ('type' in part) {
        // @ts-ignore TODO Errors out with expression produces a union type that is too complex to represent
        if (part && fns[part.type]) {
          resultFromValue = fns[part.type](
            recordPath,
            part,
            recordPath,
            index,
            formPartMap
          )
        } else {
          console.log('UNSUPPORTED FIELD TYPE', part)
        }
        // These parts have subparts that must be combined together
        switch (part.type) {
          case 'bool':
            {
              if (
                'show-parts-when-true' in part &&
                part['show-parts-when-true'] &&
                getFlatRecordValue(flatRecord, recordPath, 'bool')?.value
              ) {
                resultsFromSubparts = handleFormPartsArray(
                  part['show-parts-when-true'],
                  recordPath.concat('parts')
                )
              }
            }
            break
          case 'list-with-parts':
            {
              const listOptions = resolveRef(part.options, commonRefTable)
              if (listOptions) {
                const recordValue = getFlatRecordValue(
                  flatRecord,
                  recordPath,
                  'list-with-parts'
                )
                const subparts = listOptions.filter(
                  (_subpart, index) =>
                    recordValue?.value && recordValue.value.selections[index]
                )
                resultsFromSubparts = handleFormPartsArray(
                  subparts,
                  recordPath.concat('list-parts')
                )
              }
            }
            break
        }
      }
      if ('parts' in part && part.parts) {
        const subparts = resolveRef(part.parts, commonRefTable)

        if (subparts) {
          resultsFromSubparts = _.concat(
            handleFormPartsArray(subparts, recordPath.concat('parts')),
            resultsFromSubparts
          )
        }
      }
    }
    const subpartsResult = resultsFromSubparts
      ? fns.combineResultsFromSubparts(
          resultsFromSubparts,
          part,
          resultFromValue,
          recordPath,
          index,
          formPartMap
        )
      : null

    return fns.post(
      part,
      subpartsResult,
      resultFromValue,
      recordPath,
      index,
      pre,
      formPartMap,
      partOptional
    )
  }

  // -------------------
  // mapSectionWithPaths
  // -------------------

  if (
    shouldSkipConditional(section, flatRecord) ||
    _.isNil(section) ||
    _.isNil(section.parts) ||
    _.isNil(section.name)
  )
    return identity

  const partsListPath = ['sections', section.name, 'parts']
  const resultsFromParts = handleFormPartsArray(section.parts, partsListPath)

  return fns.combineResultsFromParts(resultsFromParts, partsListPath, 0)
}

export function isSectionComplete(
  section: NamedFormSection,
  commonRefTable: Record<string, FormDefinition>,
  flatRecord: FlatRecord
) {
  return mapSectionWithPaths<boolean>(
    section,
    commonRefTable,
    true,
    flatRecord,
    {
      pre: () => true,
      address: valuePath =>
        getFlatRecordValue(flatRecord, valuePath, 'address')?.value !=
        undefined,
      'body-image': valuePath =>
        getFlatRecordValue(flatRecord, valuePath, 'body-image')?.value !=
        undefined,
      bool: valuePath =>
        getFlatRecordValue(flatRecord, valuePath, 'bool')?.value != undefined,
      date: valuePath =>
        getFlatRecordValue(flatRecord, valuePath, 'date')?.value != undefined,
      'date-time': valuePath =>
        getFlatRecordValue(flatRecord, valuePath, 'date-time')?.value !=
        undefined,
      email: valuePath =>
        getFlatRecordValue(flatRecord, valuePath, 'email')?.value != undefined,
      gender: valuePath =>
        getFlatRecordValue(flatRecord, valuePath, 'gender')?.value != undefined,
      list: valuePath =>
        getFlatRecordValue(flatRecord, valuePath, 'list')?.value != undefined,
      'list-with-labels': valuePath =>
        getFlatRecordValue(flatRecord, valuePath, 'list-with-labels')?.value !=
        undefined,
      'list-multiple': valuePath =>
        _.some(
          getFlatRecordValue(flatRecord, valuePath, 'list-multiple')?.value
            ?.selections
        ),
      'list-with-labels-multiple': valuePath =>
        _.some(
          getFlatRecordValue(flatRecord, valuePath, 'list-with-labels-multiple')
            ?.value?.selections
        ),
      'list-with-parts': valuePath =>
        _.some(
          getFlatRecordValue(flatRecord, valuePath, 'list-with-parts')?.value
            ?.selections
        ),
      'long-text': valuePath =>
        getFlatRecordValue(flatRecord, valuePath, 'long-text')?.value !=
        undefined,
      number: valuePath =>
        getFlatRecordValue(flatRecord, valuePath, 'number')?.value != undefined,
      'phone-number': valuePath =>
        getFlatRecordValue(flatRecord, valuePath, 'phone-number')?.value !=
        undefined,
      photo: valuePath =>
        _.some(getFlatRecordValue(flatRecord, valuePath, 'photo')?.value),
      sex: valuePath =>
        getFlatRecordValue(flatRecord, valuePath, 'sex')?.value != undefined,
      text: valuePath =>
        getFlatRecordValue(flatRecord, valuePath, 'text')?.value != undefined,
      signature: valuePath =>
        getFlatRecordValue(flatRecord, valuePath, 'signature')?.value.sha256 !=
        undefined,
      combineResultsFromParts: results =>
        _.reduce(results, (a, b) => a && b, true as boolean),
      combineResultsFromSubparts: results => {
        const result = _.reduce(results, (a, b) => a && b)
        if (result === undefined) return true
        else return result
      },
      preRepeat: () => {},
      preEachRepeat: () => {},
      eachRepeat: result => result,
      postRepeated: list =>
        _.reduce(
          _.map(list, e => e.result),
          (a, b) => a && b,
          true as boolean
        ),
      post: (
        _part,
        subparts,
        inner,
        recordPath,
        _index,
        _pre,
        _formPartMap,
        partOptional
      ) => {
        return (
          (partOptional &&
            getFlatRecordValue(flatRecord, recordPath)?.skipped) ||
          ((inner === null ? true : inner) &&
            (subparts === null ? true : subparts))
        )
      },
    }
  )
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

export function stripFileExtension(filename: string) {
  return filename.substr(0, filename.lastIndexOf('.')) || filename
}

export function isImageExtension(filename: string) {
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
