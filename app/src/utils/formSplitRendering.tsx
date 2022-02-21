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

import { Center, Divider, VStack, Text, Heading } from 'native-base'

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

export type URI = string

/* This is a more efficient form renderer. Rather than being hierarchical, this
 * renders flat forms. First it emits a list of render commands given the form
 * and its current state. Then those commands are rendered. Commands have stable
 * ids appropriate form lazy loading.
 */

export function wrapCommandMemo<T extends object>(
  component: React.FunctionComponent<T>
): React.NamedExoticComponent<T & { command: RenderCommand }> {
  return React.memo(
    component,
    (prev, next) =>
      //@ts-ignore
      next.keepAlive === true ||
      //@ts-ignore
      prev.command === next.command ||
      //@ts-ignore
      _.isEqual(prev.command, next.command)
  )
}

const CDebouncedTextInput = wrapCommandMemo(DebouncedTextInput)
const CButtonGroup = wrapCommandMemo(ButtonGroup)
const CBodyImage = wrapCommandMemo(BodyImage)
const CDateTimePicker = wrapCommandMemo(DateTimePicker)
const CList = wrapCommandMemo(List)
const CListSelectMultiple = wrapCommandMemo(ListSelectMultiple)
const CPhoto = wrapCommandMemo(Photo)
const CSignature = wrapCommandMemo(Signature)
const CCenter = wrapCommandMemo(Center)

export type RenderCommand =
  // Commands that correspond to structural UI components
  (
    | {
        type: 'title'
        title: string
        size: string
        fontWeight: string
      }
    | {
        type: 'description'
        description: string
      }
    | {
        type: 'divider'
        thickness: number
      }
    // Commands that correspond to form components
    | {
        type: 'address'
        text: string | undefined
        placeholder: string | undefined
      }
    | {
        type: 'body-image'
        backgroundImage: URI
        annotations: RecordDataByType['body-image']['annotations']
        annotationPath: RecordPath
      }
    | { type: 'bool'; selected: boolean | null }
    | { type: 'date'; date: Date; title: string }
    | { type: 'date-time'; date: Date; title: string }
    | {
        type: 'email'
        text: string | undefined
        placeholder: string | undefined
      }
    | { type: 'gender'; selected: string; options: Record<string, string> }
    | {
        type: 'list'
        value: string
        options: string[] | boolean[] | number[] | null
        other: 'text' | 'long-text' | undefined
        otherValue: string | null
        otherPath: RecordPath
      }
    | {
        type: 'list-multiple'
        values: boolean[]
        valuePaths: RecordPath[]
        otherChecked: boolean | null
        otherText: string | undefined
        otherPath: RecordPath
        otherPathText: RecordPath
        other: 'text' | 'long-text' | undefined
        options: string[] | boolean[] | number[]
      }
    | {
        type: 'list-with-labels'
        options: FormKVRawType[] | null
        value: string | null
        other: 'text' | 'long-text' | undefined
        otherValue: string | null
        otherPath: RecordPath
      }
    | {
        type: 'list-with-labels-multiple'
        options: FormKVRawType[]
        value: any[]
        valuePaths: RecordPath[]
        other: 'text' | 'long-text' | undefined
        otherValue: string | null
      }
    | {
        type: 'list-with-parts'
        // TODO list-with-parts
      }
    | {
        type: 'long-text'
        text: string
        numberOfLines: number
        placeholder: string | undefined
      }
    | { type: 'number'; value: string; placeholder: string | undefined }
    | { type: 'phone-number'; value: string }
    | { type: 'photo'; photos: RecordPhoto[] }
    | { type: 'sex'; value: string; options: Record<string, string> }
    | { type: 'signature'; image: URI; date: Date }
    | { type: 'text'; text: string; placeholder: string | undefined }
  ) & { valuePath: RecordPath; key: string }

export function renderCommand(
  command: RenderCommand,
  setPath: (path: RecordPath, value: any) => any,
  addKeepAlive: (n: string) => any,
  removeKeepAlive: (n: string) => any
) {
  switch (command.type) {
    case 'title':
      return (
        <CCenter command={command} pt={4} pb={2}>
          <Heading size={command.size} fontWeight={command.fontWeight}>
            {command.title}
          </Heading>
        </CCenter>
      )
    case 'description':
      return <Text pb={2}>{command.description}</Text>
    case 'divider':
      return <Divider my={2} thickness={command.thickness} />
    case 'address':
      return (
        <CDebouncedTextInput
          command={command}
          onChangeText={text => {
            setPath(command.valuePath, text)
          }}
          debounceMs={500}
          size="md"
          bg="coolGray.100"
          variant="filled"
          w="100%"
          textAlign="center"
          textContentType="fullStreetAddress"
          keyboardType="default"
          multiline={true}
          numberOfLines={3}
          placeholder={command.placeholder}
          value={command.text}
        />
      )
    case 'body-image':
      return (
        <CBodyImage
          command={command}
          imageURI={command.backgroundImage}
          annotations={command.annotations}
          addMarkerData={(
            toAdd: ArrayElement<RecordDataByType['body-image']['annotations']>,
            index: number | null
          ) => {
            let array = command.annotations
            if (index !== null) {
              array.splice(index, 1, toAdd)
            } else {
              array = array.concat(toAdd)
            }
            setPath(command.annotationPath, array)
          }}
          removeMarkerData={(n: number) => {
            const r = _.cloneDeep(command.annotations)
            _.pullAt(r, [n])
            setPath(command.annotationPath, r)
          }}
        />
      )
    case 'bool':
      return (
        <CButtonGroup
          command={command}
          selected={command.selected}
          options={{ Yes: true, No: false }}
          onPress={v => setPath(command.valuePath, v)}
        />
      )
    case 'date':
      return (
        <CDateTimePicker
          command={command}
          // @ts-ignore TODO Why not?
          title={command.title}
          date={command.date}
          open={() => addKeepAlive(_.join(command.valuePath, '.'))}
          close={() => removeKeepAlive(_.join(command.valuePath, '.'))}
          setDate={(date: Date) => setPath(command.valuePath, date)}
        />
      )
    case 'date-time':
      return (
        <CDateTimePicker
          command={command}
          // @ts-ignore TODO Why not?
          title={command.title}
          date={command.date}
          open={() => addKeepAlive(_.join(command.valuePath, '.'))}
          close={() => removeKeepAlive(_.join(command.valuePath, '.'))}
          setDate={(date: Date) => setPath(command.valuePath, date)}
          time
        />
      )
    case 'email':
      return (
        <CDebouncedTextInput
          command={command}
          onChangeText={text => setPath(command.valuePath, text)}
          debounceMs={500}
          size="md"
          bg="coolGray.100"
          variant="filled"
          w="100%"
          textAlign="center"
          textContentType="emailAddress"
          keyboardType="email-address"
          placeholder={command.placeholder}
          value={command.text}
        />
      )
    case 'gender':
      return (
        <CButtonGroup
          command={command}
          selected={command.selected}
          options={command.options}
          onPress={v => setPath(command.valuePath, v)}
        />
      )
    case 'list':
      return (
        <CList
          command={command}
          options={command.options}
          value={command.value}
          onSelect={s => setPath(command.valuePath, s)}
          other={command.other}
          otherValue={command.otherValue}
          onOtherValue={s => setPath(command.otherPath, s)}
        />
      )
    case 'list-multiple':
      return (
        <CListSelectMultiple
          command={command}
          values={command.values}
          otherChecked={command.otherChecked}
          otherText={command.otherText}
          options={command.options}
          other={command.other}
          togglePathValue={(idx: number) =>
            setPath(command.valuePaths[idx], !command.values[idx])
          }
          toggleOtherChecked={() =>
            setPath(command.otherPath, !command.otherChecked)
          }
          setOtherText={(s: string | undefined) =>
            setPath(command.otherPathText, s)
          }
        />
      )
    case 'list-with-labels':
      return (
        <CList
          command={command}
          withLabels
          options={command.options}
          value={command.value}
          onSelect={s => setPath(command.valuePath, s)}
          other={command.other}
          otherValue={command.otherValue}
          onOtherValue={s => setPath(command.otherPath, s)}
        />
      )
    case 'list-with-labels-multiple':
      // TODO
      return <></>
    case 'list-with-parts':
      // TODO
      return <></>
    case 'long-text':
      return (
        <CDebouncedTextInput
          command={command}
          onChangeText={text => {
            setPath(command.valuePath, text)
          }}
          debounceMs={500}
          placeholder={command.placeholder}
          size="md"
          bg="coolGray.100"
          variant="filled"
          w="100%"
          multiline={true}
          numberOfLines={command.numberOfLines}
          value={command.text}
        />
      )
    case 'number':
      return (
        <CDebouncedTextInput
          command={command}
          onChangeText={text => {
            setPath(command.valuePath, text)
          }}
          debounceMs={500}
          placeholder={command.placeholder}
          size="md"
          bg="coolGray.100"
          variant="filled"
          w="100%"
          textAlign="center"
          keyboardType="numeric"
          value={command.value}
        />
      )
    case 'phone-number':
      return (
        <CDebouncedTextInput
          command={command}
          onChangeText={text => {
            setPath(command.valuePath, text)
          }}
          debounceMs={500}
          size="md"
          bg="coolGray.100"
          variant="filled"
          w="100%"
          textAlign="center"
          textContentType="telephoneNumber"
          keyboardType="phone-pad"
          value={command.value}
        />
      )
    case 'photo':
      return (
        <CPhoto
          command={command}
          photos={command.photos}
          addPhoto={(
            toAdd: ArrayElement<RecordDataByType['photo']['value']>
          ) => {
            setPath(command.valuePath, command.photos.concat(toAdd))
          }}
          removePhoto={(n: number) => {
            const r = _.cloneDeep(command.photos)
            _.pullAt(r, [n])
            setPath(command.valuePath, r)
          }}
        />
      )
    case 'sex':
      return (
        <CButtonGroup
          command={command}
          selected={command.value}
          options={command.options}
          onPress={v => setPath(command.valuePath, v)}
        />
      )
    case 'signature':
      return (
        <CSignature
          command={command}
          // @ts-ignore Why isn't TS happy here?
          imageURI={command.image}
          open={() => {
            addKeepAlive(_.join(command.valuePath, '.'))
          }}
          close={() => {
            removeKeepAlive(_.join(command.valuePath, '.'))
          }}
          setSignature={(dataURI: string) =>
            setPath(command.valuePath, dataURI)
          }
        />
      )
    case 'text':
      return (
        <CDebouncedTextInput
          command={command}
          onChangeText={text => {
            setPath(command.valuePath, text)
          }}
          debounceMs={500}
          placeholder={command.placeholder}
          size="md"
          bg="coolGray.100"
          variant="filled"
          w="100%"
          textAlign="center"
          value={command.text}
        />
      )
  }
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
        const size = recordPath.length < 4 ? 'md' : 'sm'
        const fontWeight = recordPath.length < 6 ? 'bold' : 'normal'
        renderCommands.push({
          type: 'title',
          valuePath: recordPath.concat('title'),
          key: _.join(recordPath.concat('title'), '.'),
          title: 'title' in part ? part.title : '',
          size,
          fontWeight,
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
    selectMultiple: (valuePaths, part, recordPath, index, otherPath) =>
      renderCommands.push({
        type: 'list-multiple',
        valuePath: valuePaths[0],
        key: _.join(valuePaths[0], '.'),
        values: valuePaths.map((p: RecordPath) =>
          getPath(p, _.isBoolean, false)
        ),
        valuePaths,
        otherChecked: getPath(otherPath, _.isBoolean, false),
        otherText:
          otherPath && getPath(otherPath.concat('.value'), _.isString, ''),
        otherPath: otherPath,
        otherPathText: otherPath && otherPath.concat('.value'),
        // @ts-ignore TODO This combines two cases, split them
        options:
          'options' in part && _.isArray(part.options) ? part.options : [],
      }),
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
  })
  return renderCommands
}
