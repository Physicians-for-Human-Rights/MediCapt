import { Platform } from 'react-native'
import * as FileSystem from 'expo-file-system'
import _ from 'lodash'

export function plainToFlattenObject(object) {
  const result = {}
  function flatten(obj, prefix = '') {
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

export function objectPaths(object) {
  const result = []
  function flatten(obj, prefix = '') {
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

export function mapSectionWithPaths(section, getValue, fns) {
  function process(entry, index, formPath) {
    if (Array.isArray(entry)) {
      return entry.map((e, i) => {
        return process(e, i, formPath)
      })
    } else {
      const obj = entry[Object.keys(entry)[0]]
      let inner = null
      formPath = formPath + '.' + Object.keys(entry)[0]
      if (_.has(obj, 'only-when.path') && _.has(obj, 'only-when.value')) {
        if (
          getValue(_.get(obj, 'only-when.path')) !=
          _.has(obj, 'only-when.value')
        )
          return null
      }
      let pre = fns.pre && fns.pre(entry, obj, index, formPath)
      const field_type = _.get(obj, 'field.type')
      if (field_type) {
        switch (field_type) {
          case 'list':
            if (_.get(obj, 'field.select-multiple')) {
              inner = fns.selectMultiple(
                entry,
                obj,
                index,
                formPath,
                _.get(obj, 'field.list-options').map((e, i) => {
                  return formPath + '.field.value.' + i
                }),
                _.get(obj, 'field.other')
                  ? formPath + '.field.value.other'
                  : null
              )
            } else {
              console.log(
                'UNSUPPORTED FIELD TYPE LIST WITHOUT SELECT MUTLIPLE',
                obj
              )
            }
            break
          default:
            if (fns[field_type]) {
              inner = fns[field_type](
                entry,
                obj,
                index,
                formPath,
                formPath + '.field.value'
              )
            } else {
              console.log('UNSUPPORTED FIELD TYPE', obj)
            }
            break
        }
      }
      let subparts = null
      if (_.has(obj, 'parts')) {
        subparts = fns._combineParts(
          entry,
          obj,
          index,
          formPath,
          inner,
          process(obj.parts, 0, formPath + '.parts')
        )
      }
      return fns.post(entry, obj, index, formPath, pre, inner, subparts)
    }
  }
  return process(section.content.parts, 0, 'root.' + section.name)
}

export function allFormValuePathsForSection(section, getValue) {
  let allValuePaths = []
  mapSectionWithPaths(section, getValue, {
    selectMultiple: (entry, obj, index, formPath, valuePaths) =>
      (allValuePaths = allValuePaths.concat(valuePaths)),
    signature: (entry, obj, index, formPath, valuePath) =>
      allValuePaths.push(valuePath),
    bool: (entry, obj, index, formPath, valuePath) =>
      allValuePaths.push(valuePath),
    gender: (entry, obj, index, formPath, valuePath) =>
      allValuePaths.push(valuePath),
    text: (entry, obj, index, formPath, valuePath) =>
      allValuePaths.push(valuePath),
    'long-text': (entry, obj, index, formPath, valuePath) =>
      allValuePaths.push(valuePath),
    number: (entry, obj, index, formPath, valuePath) =>
      allValuePaths.push(valuePath),
    date: (entry, obj, index, formPath, valuePath) =>
      allValuePaths.push(valuePath),
    'date-time': (entry, obj, index, formPath, valuePath) =>
      allValuePaths.push(valuePath),
    list: (entry, obj, index, formPath, valuePath) =>
      allValuePaths.push(valuePath),
    'list-with-labels': (entry, obj, index, formPath, valuePath) =>
      allValuePaths.push(valuePath),
    'phone-number': (entry, obj, index, formPath, valuePath) =>
      allValuePaths.push(valuePath),
    address: (entry, obj, index, formPath, valuePath) =>
      allValuePaths.push(valuePath),
    _combineParts: (entry, obj, index, inner, outer) => null,
    post: (entry, obj, index, formPath, pre, inner, subparts) => null,
  })
  return allValuePaths
}

export function isSectionComplete(section, getValue) {
  let complete = true
  mapSectionWithPaths(section, getValue, {
    selectMultiple: (entry, obj, index, formPath, valuePaths) =>
      // NB This checks not that getValue exists, but that at least one of them is also true.
      (complete = complete && _.some(valuePaths, x => getValue(x))),
    signature: (entry, obj, index, formPath, valuePath) =>
      (complete = complete && getValue(valuePath) != null),
    bool: (entry, obj, index, formPath, valuePath) =>
      (complete = complete && getValue(valuePath) != null),
    gender: (entry, obj, index, formPath, valuePath) =>
      (complete = complete && getValue(valuePath) != null),
    text: (entry, obj, index, formPath, valuePath) =>
      (complete = complete && getValue(valuePath) != null),
    'long-text': (entry, obj, index, formPath, valuePath) =>
      (complete = complete && getValue(valuePath) != null),
    number: (entry, obj, index, formPath, valuePath) =>
      (complete = complete && getValue(valuePath) != null),
    date: (entry, obj, index, formPath, valuePath) =>
      (complete = complete && getValue(valuePath) != null),
    'date-time': (entry, obj, index, formPath, valuePath) =>
      (complete = complete && getValue(valuePath) != null),
    list: (entry, obj, index, formPath, valuePath) =>
      (complete = complete && getValue(valuePath) != null),
    'list-with-labels': (entry, obj, index, formPath, valuePath) =>
      (complete = complete && getValue(valuePath) != null),
    'phone-number': (entry, obj, index, formPath, valuePath) =>
      (complete = complete && getValue(valuePath) != null),
    address: (entry, obj, index, formPath, valuePath) =>
      (complete = complete && getValue(valuePath) != null),
    _combineParts: (entry, obj, index, inner, outer) => null,
    post: (entry, obj, index, formPath, pre, inner, subparts) => null,
  })
  return complete
}

export function blobToBase64(blob: Blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

export async function readImage(uri: string, mimePrefix: string) {
  let content = null
  if (Platform.OS == 'web') {
    content = await fetch(uri)
    content = await content.blob()
    content = await blobToBase64(content)
  } else {
    content = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    content = mimePrefix + content
  }
  return content
}
