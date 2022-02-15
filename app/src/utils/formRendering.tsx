import React, { useState, useEffect } from 'react'

import {
  Box,
  VStack,
  StatusBar,
  ScrollView,
  HStack,
  Pressable,
  // Icon,
  // Image,
  Text,
  Hidden,
  useColorMode,
  IconButton,
  Divider,
  Menu,
  Avatar,
  Button as BButton,
  Input,
  Center,
  useBreakpointValue,
  Modal,
  Checkbox,
} from 'native-base'

import {
  TextInput,
  View,
  TouchableOpacity,
  Picker,
  Platform,
  ImageBackground,
} from 'react-native'
import {
  Icon,
  Button,
  ListItem,
  ButtonGroup,
  Image,
} from 'react-native-elements'
// @ts-ignore TODO TS doesn't understand .native.tsx and .web.tsx files
import DateTimePicker from 'components/DateTimePicker'
import PhotoSelector from 'components/PhotoSelector'
import _ from 'lodash'
import styles from 'styles'
import CardWrap from 'components/CardWrap'
import { FormDefinition, FormKVRawType } from 'utils/formTypes'
import { resolveRef } from 'utils/forms'
import { FormFns } from 'utils/formTypesHelpers'
// @ts-ignore typescript doesn't like platform-specific modules
import Signature from 'components/Signature'
import BodyMarker from 'components/BodyMarker'
import { ListSelectMultiple } from 'components/form-parts/List'

/*
  Render all of the components of a form recursively. This function is applied
  to a section of a form with mapSectionWithPaths.
 */

export default function renderFnsWrapper(
  files: Record<string, any>,
  common: Record<string, FormDefinition>,
  fnBody: (valuePath: string, baseImage: string, value: any) => void,
  formPaths: any,
  formGetPath: any,
  formSetPath: any,
  changedPaths: any,
  keepAlive: any,
  removeKeepAlive: any,
  addKeepAlive: any,
  noRenderCache?: boolean
): FormFns<JSX.Element> {
  function getPath(
    valuePath: string | null | undefined,
    checkTy?: (o: any) => boolean,
    _default: any = undefined
  ) {
    const r = formGetPath(valuePath)
    if (checkTy !== undefined && !checkTy(r)) return _default
    return r
  }
  return {
    pre: () => {
      return null
    },
    post: (part, subparts, inner, formPath, index, pre, skippedPath) => {
      return (
        <CardWrap
          index={index}
          key={formPath}
          title={'title' in part ? part.title : null}
          formPath={formPath}
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
          skipped={formGetPath(skippedPath, false)}
          toggleSkip={() => {
            formSetPath(skippedPath, !formGetPath(skippedPath))
          }}
          noRenderCache={noRenderCache}
        />
      )
    },
    combinePlainParts: (subparts, formPath, index) => {
      return <View key={formPath + index}>{subparts}</View>
    },
    combineSmartParts: (part, subparts, inner, formPath, index) => {
      return <View key={formPath + index}>{subparts}</View>
    },
    selectMultiple: (valuePaths, part, formPath, index, otherPath) => {
      return (
        <ListSelectMultiple
          valuePaths={valuePaths}
          // @ts-ignore type too complex for ts
          part={part}
          formPath={formPath}
          otherPath={otherPath}
          otherPathValue={otherPath + '.value'}
          getPath={getPath}
          setPath={formSetPath}
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
          setSignature={(dataURI: string) => formSetPath(valuePath, dataURI)}
        />
      )
    },
    'body-image': (valuePath, part) => {
      let title = null
      let image = null
      let icon = null
      let buttonStyle = {}
      // TODO narrow this type
      const value = getPath(valuePath, _.isPlainObject, {})
      let imageUri: string | null = null
      icon = <Icon name="edit" size={15} color="white" />
      if (value && formGetPath(valuePath)) {
        title = ' Edit diagram'
        image = (
          <View style={{ width: 200, height: 200 }}>
            <BodyMarker
              baseImage={value.image}
              annotations={value.annotations}
            />
          </View>
        )
      } else {
        title = ' Mark and annotate'
        buttonStyle = { backgroundColor: '#d5001c' }
        const genderOrSex: string =
          getPath('inferred.sex', _.isString, '') ||
          getPath('inferred.gender', _.isString, '')
        if ('filename' in part && part.filename) {
          imageUri = files[part.filename]
        } else if (
          'filename-female' in part &&
          part['filename-female'] &&
          genderOrSex &&
          genderOrSex === 'female'
        ) {
          imageUri = files[part['filename-female']]
        } else if (
          'filename-inteserx' in part &&
          part['filename-intersex'] &&
          genderOrSex &&
          genderOrSex === 'intersex'
        ) {
          imageUri = files[part['filename-intersex']]
        } else if (
          'filename-male' in part &&
          part['filename-male'] &&
          genderOrSex &&
          genderOrSex === 'male'
        ) {
          imageUri = files[part['filename-male']]
        } else {
          // TODO
          console.log(
            'NO IMAGE, What do we do here? Prevent this from being filled out? Show a message?'
          )
        }
        image = (
          <Image
            resizeMode="contain"
            style={{ width: 200, height: 200 }}
            source={{ uri: imageUri }}
          />
        )
      }
      return (
        <View>
          <View
            style={{
              justifyContent: 'center',
              flexDirection: 'row',
              marginBottom: 10,
            }}
          >
            {image}
          </View>
          <Button
            icon={icon}
            title={title}
            buttonStyle={buttonStyle}
            onPress={() => fnBody(valuePath, imageUri, value)}
          />
        </View>
      )
    },
    bool: valuePath => {
      const value = getPath(valuePath, _.isBoolean, null)
      return (
        <BButton.Group
          isAttached
          w="100%"
          size="md"
          colorScheme="blue"
          flex={1}
          justifyContent="center"
        >
          <BButton
            flex={1}
            _text={{ bold: true }}
            maxW="30%"
            onPress={() => formSetPath(valuePath, true)}
            variant={value === true ? undefined : 'outline'}
          >
            Yes
          </BButton>
          <BButton
            flex={1}
            _text={{ bold: true }}
            maxW="30%"
            onPress={() => formSetPath(valuePath, false)}
            variant={value === false ? undefined : 'outline'}
          >
            No
          </BButton>
        </BButton.Group>
      )
    },
    gender: valuePath => {
      let options: Array<FormKVRawType> =
        'gender' in common
          ? // TODO Check this at runtime
            (common.gender as Array<FormKVRawType>)
          : [
              // TODO This is a conservative approach if no gender key is specified
              // Do we want something else?
              { key: 'male', value: 'Male' },
              { key: 'female', value: 'Female' },
            ]
      let selected = formPaths[valuePath]
        ? _.indexOf(
            _.map(options, x => x.key),
            formPaths[valuePath]
          )
        : null
      return (
        <ButtonGroup
          selectedIndex={selected}
          onPress={i => formSetPath(valuePath, _.map(options, x => x.key)[i])}
          buttons={_.map(options, x => '' + x.value)}
        />
      )
    },
    text: (valuePath, part) => {
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
          placeholder={part.placeholder}
          textAlign={'center'}
          editable={true}
          onChangeText={text => formSetPath(valuePath, text)}
          value={getPath(valuePath, _.isString, '')}
        />
      )
    },
    'long-text': (valuePath, part) => {
      return (
        <TextInput
          style={{
            width: '100%',
            minHeight: 40,
            maxHeight: 40000 /* TODO This limits the entry to ~1000 lines or so */,
            borderColor: 'gray',
            borderBottomWidth: 1,
            borderRadius: 5,
            backgroundColor: '#F5F5F5',
          }}
          placeholder={part.placeholder}
          textAlign={'left'}
          editable={true}
          multiline={true}
          numberOfLines={5}
          onChangeText={text => formSetPath(valuePath, text)}
          value={getPath(valuePath, _.isString, '')}
        />
      )
    },
    number: (valuePath, part) => {
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
          keyboardType={'numeric'}
          textAlign={'center'}
          editable={true}
          placeholder={part.placeholder}
          onChangeText={text => formSetPath(valuePath, text)}
          value={getPath(valuePath, _.isString, '')}
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
          onChangeText={text => formSetPath(valuePath, text)}
          value={getPath(valuePath, _.isString, '')}
        />
      )
    },
    'phone-number': valuePath => {
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
          textContentType={'telephoneNumber'}
          keyboardType={'phone-pad'}
          textAlign={'center'}
          editable={true}
          onChangeText={text => formSetPath(valuePath, text)}
          value={getPath(valuePath, _.isString, '')}
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
          setDate={(date: Date) => formSetPath(valuePath, date)}
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
          setDate={(date: Date) => formSetPath(valuePath, date)}
          time
        />
      )
    },
    'list-with-parts': () => {
      // TODO
      return <></>
    },
    list: () => {
      // TODO
      return <></>
    },
    sex: () => {
      // TODO
      return <></>
    },
    photo: valuePath => {
      const photos: Array<string> = getPath(valuePath, _.isArray, [])
        ? formGetPath(valuePath).photos
        : []
      const setPhotos: (
        cb: (prev: Array<string>) => Array<string>
      ) => void = cb => formSetPath(valuePath, { photos: cb(photos) })

      return (
        <View>
          <PhotoSelector photos={photos} setPhotos={setPhotos} />
        </View>
      )
    },
    'list-with-labels': (valuePath, part) => {
      let options = resolveRef(part.options, common)
      if (!options) return <></>
      let items = options.map((e, i) => {
        return (
          <Picker.Item
            key={i}
            label={e.key + ' (' + e.value + ')'}
            value={'' + e.value}
          />
        )
      })
      const current_value = getPath(valuePath, _.isString)
      if (!current_value) {
        items = [
          <Picker.Item key={-1} label="Select a value" value={null} />,
        ].concat(items)
      }
      return (
        <Picker
          prompt={part.title}
          selectedValue={current_value == null ? -1 : current_value}
          style={{ height: 50, width: '100%' }}
          onValueChange={(itemValue, itemIndex) => {
            if (itemValue != null) {
              formSetPath(valuePath, itemValue)
            }
          }}
        >
          {items}
        </Picker>
      )
    },
  }
}
