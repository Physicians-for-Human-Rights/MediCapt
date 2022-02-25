import _ from 'lodash'
import {
  FormValueType,
  FormPart,
  FormSectionMap,
  FormPartMap,
  FormDefinition,
  FormRef,
  FormConditional,
  FormPartCommon,
  FormPartField,
  FormKVRawType,
  MultipleFormValueTypes,
} from 'utils/formTypes'
import { mapSectionWithPaths, GetValueFn } from 'utils/forms'
import { ArrayElement, NamedFormSection, FormFns } from 'utils/formTypesHelpers'
import { RecordPhoto, RecordPath, RecordDataByType } from 'utils/recordTypes'
import React from 'react'
import { t } from 'i18n-js'
import { resolveRef } from 'utils/forms'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'
import uuid from 'react-native-uuid'

import { Icon, Center, Divider, VStack, Text, Heading } from 'native-base'
import { TextInput, View } from 'react-native'
// @ts-ignore TODO TS doesn't understand .native.tsx and .web.tsx files
import DateTimePicker from 'components/DateTimePicker'
// @ts-ignore typescript doesn't like platform-specific modules
import Signature from 'components/Signature'
import {
  List,
  ListSelectMultiple,
  isPrimitiveType,
} from 'components/form-parts/List'
import ButtonGroup from 'components/form-parts/ButtonGroup'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import Photo from 'components/form-parts/Photo'
import BodyImage from 'components/form-parts/BodyImage'
import CustomButton from 'components/form-parts/Button'
import { RenderCommand, URI } from 'utils/formRendering/types'

function getRepeatList(
  repeated: boolean | 'at-least-one',
  getPath: (
    valuePath: RecordPath | null | undefined,
    checkTy?: ((o: any) => boolean) | undefined,
    _default?: any
  ) => any,
  recordPath: RecordPath
) {
  if (repeated === 'at-least-one')
    return _.uniq(
      (getPath(recordPath.concat('repeat-list'), _.isArray, []) || []).concat(
        'at-least-one'
      )
    )
  return getPath(recordPath.concat('repeat-list'), _.isArray, []) || []
}

// Turn a section of a form into a list of flat render commands
export function allFormRenderCommands(
  files: Record<string, any>,
  section: NamedFormSection,
  commonRefTable: Record<string, FormDefinition>,
  getValue: GetValueFn
) {
  function getPath(
    valuePath: RecordPath | null | undefined,
    checkTy?: (o: any) => boolean,
    _default: any = undefined
  ) {
    if (valuePath === undefined || valuePath === null) return _default
    const r = getValue(valuePath, _default)
    if (checkTy !== undefined && !checkTy(r)) return _default
    return r
  }
  let renderCommands: RenderCommand[] = []
  // any is an ok type here because we're discarding the output
  mapSectionWithPaths<any>(section, commonRefTable, null, getValue, {
    pre: (part, recordPath) => {
      if ('title' in part) {
        const [recordPath1, _recordPart0] = _.takeRight(recordPath, 2)
        // Look for list-with-parts.<something>
        if (recordPath1 === 'list-with-parts') {
          renderCommands.push({
            type: 'divider',
            valuePath: recordPath.concat('divider'),
            key: _.join(recordPath.concat('divider'), '.'),
            thickness: 1,
            w: '50%',
          })
        }
        const isRepeated = 'repeated' in part && part.repeated
        const size = recordPath.length < 4 ? 'md' : 'sm'
        const fontWeight = isRepeated
          ? '500'
          : recordPath.length < 6
          ? 'bold'
          : 'normal'
        let suffix = ''
        if (isRepeated) {
          const [repeatPathPart, repeatId] = _.takeRight(recordPath, 2)
          if (repeatPathPart === 'repeat') {
            const repeatList = getRepeatList(
              part.repeated || false,
              getPath,
              _.dropRight(recordPath, 2)
            )
            suffix =
              ' (' +
              t('form.repeat-number') +
              ' ' +
              (_.indexOf(repeatList, repeatId) + 1) +
              ' ' +
              t('form.repeat-out-of') +
              ' ' +
              repeatList.length +
              ')'
          }
        }
        renderCommands.push({
          type: 'title',
          valuePath: recordPath.concat('title'),
          key: _.join(recordPath.concat('title'), '.'),
          title: 'title' in part ? part.title + suffix : '',
          size,
          fontWeight,
          italic: isRepeated,
        })
      }
      if ('description' in part) {
        renderCommands.push({
          type: 'description',
          valuePath: recordPath.concat('description'),
          key: _.join(recordPath.concat('description'), '.'),
          description:
            'description' in part && part.description !== undefined
              ? part.description
              : '',
        })
      }
    },
    selectMultiple: (valuePaths, part, recordPath, index, otherPath) => {
      renderCommands.push({
        type: 'list-multiple',
        valuePath: valuePaths[0],
        key: _.join(valuePaths[0], '.'),
        values: valuePaths.map((p: RecordPath) =>
          getPath(p, _.isBoolean, false)
        ),
        valuePaths,
        otherChecked:
          otherPath && getPath(otherPath.concat('checked'), _.isBoolean, false),
        otherText:
          otherPath && getPath(otherPath.concat('text'), _.isString, ''),
        otherPath: otherPath && otherPath.concat('checked'),
        otherPathText: otherPath && otherPath.concat('text'),
        // @ts-ignore TODO Help TS see this
        other: part.other,
        // @ts-ignore TODO This combines two cases, split them
        options:
          'options' in part && _.isArray(part.options) ? part.options : [],
      })
    },
    address: (valuePath, part) =>
      renderCommands.push({
        type: 'address',
        valuePath,
        key: _.join(valuePath, '.'),
        placeholder: part.placeholder,
        text: getPath(valuePath, _.isString, ''),
      }),
    'body-image': (valuePath, part) => {
      const genderOrSex: string =
        getPath(['inferred', 'sex'], _.isString, '') ||
        getPath(['inferred', 'gender'], _.isString, '')
      const annotationPath = valuePath.concat('annotations')
      const backgroundImage =
        ('filename-female' in part &&
          part['filename-female'] &&
          genderOrSex &&
          genderOrSex === 'female' &&
          files[part['filename-female']]) ||
        ('filename-inteserx' in part &&
          part['filename-intersex'] &&
          genderOrSex &&
          genderOrSex === 'intersex' &&
          files[part['filename-intersex']]) ||
        ('filename-male' in part &&
          part['filename-male'] &&
          genderOrSex &&
          genderOrSex === 'male' &&
          files[part['filename-male']]) ||
        ('filename' in part && part.filename && files[part.filename]) ||
        getPath(valuePath.concat('uri'), _.isString, null)
      if (backgroundImage === null) {
        // TODO
        console.log(
          'NO IMAGE, What do we do here? Prevent this from being filled out? Show a message?'
        )
      }
      if (
        getPath(valuePath.concat('uri'), _.isString, null) !== backgroundImage
      ) {
        // TODO Should we store this? If so, where? In the component?
        // recordSetPath(valuePath.concat('uri'), backgroundImage)
      }
      renderCommands.push({
        type: 'body-image',
        valuePath,
        key: _.join(valuePath, '.'),
        backgroundImage: backgroundImage,
        annotations: getPath(annotationPath, _.isArray, []),
        annotationPath: annotationPath,
      })
    },
    bool: valuePath =>
      renderCommands.push({
        type: 'bool',
        valuePath,
        key: _.join(valuePath, '.'),
        selected: getPath(valuePath, _.isBoolean, null),
      }),
    date: (valuePath, part) =>
      renderCommands.push({
        type: 'date',
        valuePath,
        key: _.join(valuePath, '.'),
        title: part.title,
        date: getPath(valuePath, _.isDate, null),
      }),
    'date-time': (valuePath, part) =>
      renderCommands.push({
        type: 'date-time',
        valuePath,
        key: _.join(valuePath, '.'),
        title: part.title,
        date: getPath(valuePath, _.isDate, null),
      }),
    email: (valuePath, part) =>
      renderCommands.push({
        type: 'email',
        valuePath,
        key: _.join(valuePath, '.'),
        placeholder: part.placeholder,
        text: getPath(valuePath, _.isString, ''),
      }),
    gender: valuePath =>
      renderCommands.push({
        type: 'gender',
        valuePath,
        key: _.join(valuePath, '.'),
        selected: getPath(valuePath, _.isString, ''),
        options: _.fromPairs(
          _.map(
            'gender' in commonRefTable
              ? // TODO Check this at runtime
                (commonRefTable.gender as Array<FormKVRawType>)
              : [
                  // TODO This is a conservative approach if no gender key is specified
                  // Do we want something else?
                  { key: 'male', value: t('gender.Male') },
                  { key: 'female', value: t('gender.Female') },
                  { key: 'transgender', value: t('gender.Transgender') },
                ],
            o => [o.value, o.key]
          )
        ) as Record<string, string>,
      }),
    list: (valuePath, part, recordPath) =>
      renderCommands.push({
        type: 'list',
        valuePath,
        key: _.join(valuePath, '.'),
        value: getPath(valuePath, isPrimitiveType, null),
        other: part.other,
        otherValue: getPath(recordPath.concat('other'), _.isString, null),
        otherPath: recordPath.concat('other'),
        options: resolveRef(part.options, commonRefTable),
      }),
    'list-with-labels': (valuePath, part, recordPath) =>
      renderCommands.push({
        type: 'list-with-labels',
        valuePath,
        key: _.join(valuePath, '.'),
        value: getPath(valuePath, isPrimitiveType, null),
        other: part.other,
        otherValue: getPath(recordPath.concat('other'), _.isString, null),
        otherPath: recordPath.concat('other'),
        options: resolveRef(part.options, commonRefTable),
      }),
    // TODO list-with-parts
    'list-with-parts': () => null,
    'long-text': (valuePath, part) =>
      renderCommands.push({
        type: 'long-text',
        valuePath,
        key: _.join(valuePath, '.'),
        placeholder: part.placeholder,
        text: getPath(valuePath, _.isString, ''),
        numberOfLines:
          part['number-of-lines'] === null ||
          part['number-of-lines'] === undefined
            ? 5
            : part['number-of-lines'],
      }),
    number: (valuePath, part) =>
      renderCommands.push({
        type: 'number',
        valuePath,
        key: _.join(valuePath, '.'),
        placeholder: part.placeholder,
        value: getPath(valuePath, _.isString, ''),
      }),
    'phone-number': valuePath =>
      renderCommands.push({
        type: 'phone-number',
        valuePath,
        key: _.join(valuePath, '.'),
        value: getPath(valuePath, _.isString, ''),
      }),
    photo: valuePath =>
      renderCommands.push({
        type: 'photo',
        valuePath,
        key: _.join(valuePath, '.'),
        photos: getPath(valuePath, _.isArray, []),
      }),
    sex: valuePath =>
      renderCommands.push({
        type: 'gender',
        valuePath,
        key: _.join(valuePath, '.'),
        selected: getPath(valuePath, _.isString, ''),
        options: _.fromPairs(
          _.map(
            'sex' in commonRefTable
              ? // TODO Check this at runtime
                (commonRefTable.sex as Array<FormKVRawType>)
              : [
                  // TODO This is a conservative approach if no gender key is specified
                  // Do we want something else?
                  { key: 'male', value: t('sex.Male') },
                  { key: 'female', value: t('sex.Female') },
                  { key: 'trans', value: t('sex.Trans') },
                ],
            o => [o.value, o.key]
          )
        ) as Record<string, string>,
      }),
    signature: (valuePath, part, recordPath) =>
      renderCommands.push({
        type: 'signature',
        valuePath,
        key: _.join(valuePath, '.'),
        image: getPath(valuePath, _.isString, null),
        date: getPath(recordPath.concat('date'), _.isDate, null),
      }),
    text: (valuePath, part) =>
      renderCommands.push({
        type: 'text',
        valuePath,
        key: _.join(valuePath, '.'),
        placeholder: part.placeholder,
        text: getPath(valuePath, _.isString, ''),
      }),
    combinePlainParts: () => null,
    combineSmartParts: () => null,
    post: (part, subparts, inner, recordPath) => {
      if (recordPath.length === 3) {
        renderCommands.push({
          type: 'divider',
          valuePath: recordPath.concat('divider'),
          key: _.join(recordPath.concat('divider'), '.'),
          thickness: 1,
        })
      }
    },
    preRepeat: (part, recordPath) => {
      let suffix = ''
      if ('repeated' in part && part.repeated) {
        const nr = getRepeatList(
          part.repeated || false,
          getPath,
          recordPath
        ).length
        if (nr === 1) {
          suffix = ' (' + t('form.repeated-one-time-below') + ')'
        } else if (nr > 0) {
          suffix =
            ' (' +
            t('form.repeated') +
            ' ' +
            nr +
            ' ' +
            t('form.times-below') +
            ')'
        } else {
          suffix = ' (' + t('form.can-repeat-below') + ')'
        }
      }
      renderCommands.push({
        type: 'title',
        valuePath: recordPath.concat('title'),
        key: _.join(recordPath.concat('title'), '.'),
        title: 'title' in part ? part.title + suffix : '',
        size: 'sm',
        fontWeight: 'bold',
        italic: false,
      })
    },
    preEachRepeat: (part, recordPath, repeatId, repeatPath) => {
      if (_.last(repeatPath) === 'at-least-one') {
        return
      }
      renderCommands.push({
        type: 'remove-repeat-button',
        valuePath: repeatPath.concat('add-repeat-button'),
        key: _.join(repeatPath.concat('add-repeat-button'), '.'),
        title: 'title' in part ? part.title : '',
        repeatList: getRepeatList(part.repeated || false, getPath, recordPath),
        repeatListPath: recordPath.concat('repeat-list'),
        repeatId: repeatId + '',
      })
    },
    eachRepeat: (result, part, recordPath, repeatId, repeatPath) => {},
    postRepeated: (list, part, recordPath) => {
      renderCommands.push({
        type: 'add-repeat-button',
        valuePath: recordPath.concat('add-repeat-button'),
        key: _.join(recordPath.concat('add-repeat-button'), '.'),
        title: 'title' in part ? part.title : '',
        repeatList: getRepeatList(part.repeated || false, getPath, recordPath),
        repeatListPath: recordPath.concat('repeat-list'),
      })
    },
  })
  return renderCommands
}
