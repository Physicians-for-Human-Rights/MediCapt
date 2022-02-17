import React, { useState, useEffect } from 'react'
import { t } from 'i18n-js'

import { Text } from 'native-base'

import { TextInput, View } from 'react-native'
// @ts-ignore TODO TS doesn't understand .native.tsx and .web.tsx files
import DateTimePicker from 'components/DateTimePicker'
import _ from 'lodash'
import styles from 'styles'
import CardWrap from 'components/CardWrap'
import { FormDefinition, FormKVRawType } from 'utils/formTypes'
import { RecordPath, RecordDataByType } from 'utils/recordTypes'
import { resolveRef } from 'utils/forms'
import { FormFns, ArrayElement } from 'utils/formTypesHelpers'
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

/*
  Render all of the components of a form recursively. This function is applied
  to a section of a form with mapSectionWithPaths.
 */

export default function renderFnsWrapper(
  files: Record<string, any>,
  common: Record<string, FormDefinition>,
  fnBody: (valuePath: RecordPath, baseImage: string, value: any) => void,
  recordGetPath: any,
  recordSetPath: any,
  changedPaths: any,
  keepAlive: any,
  removeKeepAlive: any,
  addKeepAlive: any,
  noRenderCache?: boolean
): FormFns<JSX.Element> {
  function getPath(
    valuePath: RecordPath | null | undefined,
    checkTy?: (o: any) => boolean,
    _default: any = undefined
  ) {
    const r = recordGetPath(valuePath)
    if (checkTy !== undefined && !checkTy(r)) return _default
    return r
  }
  return {
    pre: () => {
      return null
    },
    post: (part, subparts, inner, recordPath, index, pre, skippedPath) => {
      return (
        <CardWrap
          index={index}
          key={_.last(recordPath)}
          title={'title' in part ? part.title : null}
          recordPath={recordPath}
          description={
            'description' in part ? (
              <Text style={styles.bottomSpace}>{part.description}</Text>
            ) : null
          }
          rawDescription={'description' in part ? part.description : null}
          inner={inner}
          subparts={subparts}
          changedPaths={changedPaths}
          keepAlive={keepAlive}
          skippable={skippedPath !== null}
          skipped={recordGetPath(skippedPath, false)}
          toggleSkip={() => {
            recordSetPath(skippedPath, !recordGetPath(skippedPath))
          }}
          noRenderCache={noRenderCache}
          showBox={'show-box' in part ? part['show-box'] : null}
        />
      )
    },
    combinePlainParts: (subparts, recordPath, index) => {
      return <View key={index}>{subparts}</View>
    },
    combineSmartParts: (part, subparts, inner, recordPath, index) => {
      return <View key={index}>{subparts}</View>
    },
    selectMultiple: (valuePaths, part, recordPath, index, otherPath) => {
      return (
        <ListSelectMultiple
          valuePaths={valuePaths}
          // @ts-ignore type too complex for ts
          part={part}
          recordPath={recordPath}
          otherPath={otherPath}
          otherPathValue={otherPath && otherPath.concat('.value')}
          getPath={getPath}
          setPath={recordSetPath}
        />
      )
    },
    signature: valuePath => {
      return (
        <Signature
          imageURI={getPath(valuePath, _.isString, null)}
          open={() => {
            addKeepAlive(valuePath)
          }}
          close={() => {
            removeKeepAlive(valuePath)
          }}
          setSignature={(dataURI: string) => recordSetPath(valuePath, dataURI)}
        />
      )
    },
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
        recordSetPath(valuePath.concat('uri'), backgroundImage)
      }
      return (
        <BodyImage
          imageURI={backgroundImage}
          annotations={getPath(annotationPath, _.isArray, [])}
          addMarkerData={(
            toAdd: ArrayElement<RecordDataByType['body-image']['annotations']>,
            index: number | null
          ) => {
            let array = getPath(annotationPath, _.isArray, [])
            if (index !== null) {
              array.splice(index, 1, toAdd)
            } else {
              array = array.concat(toAdd)
            }
            recordSetPath(annotationPath, array)
          }}
          removeMarkerData={(n: number) => {
            const r = _.cloneDeep(getPath(annotationPath, _.isArray, []))
            _.pullAt(r, [n])
            recordSetPath(annotationPath, r)
          }}
        />
      )
    },
    photo: valuePath => {
      return (
        <Photo
          photos={getPath(valuePath, _.isArray, [])}
          addPhoto={(
            toAdd: ArrayElement<RecordDataByType['photo']['value']>
          ) => {
            recordSetPath(
              valuePath,
              getPath(valuePath, _.isArray, []).concat(toAdd)
            )
          }}
          removePhoto={(n: number) => {
            const r = _.cloneDeep(getPath(valuePath, _.isArray, []))
            _.pullAt(r, [n])
            recordSetPath(valuePath, r)
          }}
        />
      )
    },
    bool: valuePath => {
      return (
        <ButtonGroup<boolean>
          selected={getPath(valuePath, _.isBoolean, null)}
          options={{ Yes: true, No: false }}
          onPress={v => recordSetPath(valuePath, v)}
        />
      )
    },
    gender: valuePath => {
      let options: Record<string, string> = _.fromPairs(
        _.map(
          'gender' in common
            ? // TODO Check this at runtime
              (common.gender as Array<FormKVRawType>)
            : [
                // TODO This is a conservative approach if no gender key is specified
                // Do we want something else?
                { key: 'male', value: t('gender.Male') },
                { key: 'female', value: t('gender.Female') },
                { key: 'transgender', value: t('gender.Transgender') },
              ],
          o => [o.value, o.key]
        )
      ) as Record<string, string>
      return (
        <ButtonGroup<string>
          selected={recordGetPath(valuePath, null)}
          options={options}
          onPress={v => recordSetPath(valuePath, v)}
        />
      )
    },
    text: (valuePath, part) => {
      return (
        <DebouncedTextInput
          onChangeText={text => {
            recordSetPath(valuePath, text)
          }}
          debounceMs={500}
          placeholder={part.placeholder}
          size="md"
          bg="coolGray.100"
          variant="filled"
          w="100%"
          textAlign="center"
        />
      )
    },
    'long-text': (valuePath, part) => {
      return (
        <DebouncedTextInput
          onChangeText={text => {
            recordSetPath(valuePath, text)
          }}
          debounceMs={500}
          placeholder={part.placeholder}
          size="md"
          bg="coolGray.100"
          variant="filled"
          w="100%"
          multiline={true}
          numberOfLines={
            part['number-of-lines'] === null ||
            part['number-of-lines'] === undefined
              ? 5
              : part['number-of-lines']
          }
        />
      )
    },
    number: (valuePath, part) => {
      return (
        <DebouncedTextInput
          onChangeText={text => {
            recordSetPath(valuePath, text)
          }}
          debounceMs={500}
          placeholder={part.placeholder}
          size="md"
          bg="coolGray.100"
          variant="filled"
          w="100%"
          textAlign="center"
          keyboardType={'numeric'}
        />
      )
    },
    address: (valuePath, part) => {
      return (
        <TextInput
          style={{
            width: '100%',
            height: 40,
            borderColor: 'gray',
            borderBottomWidth: 1,
            borderRadius: 5,
            backgroundColor: '#F5F5F5',
          }}
          textContentType={'fullStreetAddress'}
          keyboardType={'default'}
          textAlign={'center'}
          editable={true}
          placeholder={part.placeholder}
          onChangeText={text => recordSetPath(valuePath, text)}
          value={getPath(valuePath, _.isString, '')}
        />
      )
    },
    'phone-number': valuePath => {
      return (
        <DebouncedTextInput
          onChangeText={text => {
            recordSetPath(valuePath, text)
          }}
          debounceMs={500}
          size="md"
          bg="coolGray.100"
          variant="filled"
          w="100%"
          textAlign="center"
          textContentType={'telephoneNumber'}
          keyboardType={'phone-pad'}
        />
      )
    },
    date: (valuePath, part) => {
      return (
        <DateTimePicker
          title={part.title}
          date={getPath(valuePath, _.isDate)}
          open={() => {
            addKeepAlive(valuePath)
          }}
          close={() => {
            removeKeepAlive(valuePath)
          }}
          setDate={(date: Date) => recordSetPath(valuePath, date)}
        />
      )
    },
    'date-time': (valuePath, part) => {
      return (
        <DateTimePicker
          title={part.title}
          date={getPath(valuePath, _.isDate)}
          open={() => {
            addKeepAlive(valuePath)
          }}
          close={() => {
            removeKeepAlive(valuePath)
          }}
          setDate={(date: Date) => recordSetPath(valuePath, date)}
          time
        />
      )
    },
    sex: valuePath => {
      let options: Record<string, string> = _.fromPairs(
        _.map(
          'sex' in common
            ? // TODO Check this at runtime
              (common.sex as Array<FormKVRawType>)
            : [
                // TODO This is a conservative approach if no gender key is specified
                // Do we want something else?
                { key: 'male', value: t('sex.Male') },
                { key: 'female', value: t('sex.Female') },
                { key: 'trans', value: t('sex.Trans') },
              ],
          o => [o.value, o.key]
        )
      ) as Record<string, string>
      return (
        <ButtonGroup<string>
          selected={recordGetPath(valuePath, null)}
          options={options}
          onPress={v => recordSetPath(valuePath, v)}
        />
      )
    },
    'list-with-labels': (valuePath, part, recordPath) => {
      const options = resolveRef(part.options, common)
      if (!options) return <></>
      return (
        <List
          key={_.last(valuePath)}
          withLabels
          options={options}
          value={getPath(valuePath, isPrimitiveType, null)}
          onSelect={s => recordSetPath(valuePath, s)}
          other={part.other}
          otherValue={getPath(recordPath.concat('other'), _.isString, null)}
          onOtherValue={s => recordSetPath(recordPath.concat('other'), s)}
        />
      )
    },
    list: (valuePath, part, recordPath) => {
      const options = resolveRef(part.options, common)
      if (!options) return <></>
      return (
        <List
          key={_.last(valuePath)}
          options={options}
          value={getPath(valuePath, isPrimitiveType, null)}
          onSelect={s => recordSetPath(valuePath, s)}
          other={part.other}
          otherValue={getPath(recordPath.concat('other'), _.isString, null)}
          onOtherValue={s => recordSetPath(recordPath.concat('other'), s)}
        />
      )
    },
    'list-with-parts': () => {
      // TODO
      return <></>
    },
  }
}
