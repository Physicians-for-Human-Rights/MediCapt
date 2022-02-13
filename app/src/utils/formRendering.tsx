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

/*
  Render all of the components of a form recursively. This function is applied
  to a section of a form with mapSectionWithPaths.
 */

export default function renderFnsWrapper(
  dynamicState: Record<string, boolean>,
  setDynamicState: (newState: Record<string, boolean>) => void,
  files: Record<string, any>,
  common: Record<string, FormDefinition>,
  fnBody: (valuePath: string) => any,
  formPaths: any,
  formGetPath: any,
  formSetPath: any,
  changedPaths: any,
  keepAlive: any,
  removeKeepAlive: any,
  addKeepAlive: any,
  noRenderCache: boolean
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
    post: (entry, part, index, formPath, pre, inner, subparts, skippedPath) => {
      return (
        <CardWrap
          index={index}
          key={index}
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
    combinePlainParts: (formPath, index, subparts) => {
      return <View>{subparts}</View>
    },
    combineSmartParts: (entry, part, index, inner, formPath, subparts) => {
      return <View>{subparts}</View>
    },
    selectMultiple: (entry, part, index, formPath, valuePaths, otherPath) => {
      if ('select-multiple' in part) {
        let items =
          'options' in part && _.isArray(part.options)
            ? // @ts-ignore TODO type this
              part.options.map((e: string, i: number) => {
                let valuePath = valuePaths[i]
                let fn = () => {
                  if (formGetPath(valuePath)) {
                    formSetPath(valuePath, false)
                  } else {
                    formSetPath(valuePath, true)
                  }
                }
                return (
                  <ListItem
                    key={i}
                    Component={TouchableOpacity}
                    onPress={fn}
                    containerStyle={styles.noTopBottomBorders}
                  >
                    <ListItem.Content>
                      <ListItem.CheckBox
                        checked={formGetPath(valuePath)}
                        onPress={fn}
                      />
                      <ListItem.Title>{_.upperFirst(e)}</ListItem.Title>
                    </ListItem.Content>
                  </ListItem>
                )
              })
            : []
        if (part.other) {
          let fn = () => {
            if (formGetPath(otherPath)) {
              formSetPath(otherPath, null)
            } else {
              formSetPath(otherPath, '')
            }
          }
          items.push(
            <ListItem
              Component={TouchableOpacity}
              key={items.length}
              title={'Other'}
              checkBox={{
                checked: formGetPath(otherPath) != null,
                onPress: fn,
              }}
              onPress={fn}
              containerStyle={styles.noTopBottomBorders}
            />
          )
        }
        if (formGetPath(otherPath) != null) {
          items.push(
            <TextInput
              key={items.length}
              style={styles.hugeTextInput}
              placeholder={'Specify other'}
              textAlign={'left'}
              editable={true}
              multiline={true}
              numberOfLines={5}
              onChangeText={text => formSetPath(otherPath, text)}
              value={getPath(otherPath, _.isString, '')}
            />
          )
        }
        return <View>{items}</View>
      } else {
        // TODO Error handling
        console.error(
          'UNSUPPORTED FIELD TYPE LIST WITHOUT SELECT MUTLIPLE',
          part
        )
        return null
      }
    },
    signature: (entry, part, index, formPath, valuePath) => {
      return (
        <Signature
          imageURI={getPath(valuePath, _.isString, null)}
          openSignature={() =>
            setDynamicState({ ['isVisible_signature_' + valuePath]: true })
          }
          closeSignature={() =>
            setDynamicState({ ['isVisible_signature_' + valuePath]: false })
          }
          isOpenSignature={dynamicState['isVisible_signature_' + valuePath]}
          setSignature={(dataURI: string) => formSetPath(valuePath, dataURI)}
        />
      )
    },
    'body-image': (entry, part, index, formPath, valuePath) => {
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
        imageUri = null
        image = (
          <ImageBackground
            imageStyle={{ resizeMode: 'contain' }}
            style={{ width: 200, height: 200 }}
            source={{ uri: formGetPath(valuePath).image }}
          >
            {value.annotations.map((annotation, idx) => (
              <View
                key={idx}
                style={{
                  position: 'absolute',
                  flexDirection: 'row',
                  top: annotation.markerCoordinates.y * 200 - 2.5,
                  left: annotation.markerCoordinates.x * 200 - 2.5,
                }}
              >
                <View
                  style={{
                    backgroundColor: 'red',
                    height: 5,
                    width: 5,
                  }}
                />
                <Text
                  style={{
                    color: 'red',
                    fontWeight: 'bold',
                    fontSize: 8,
                  }}
                >
                  {idx}
                </Text>
              </View>
            ))}
          </ImageBackground>
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
            onPress={() => fnBody(valuePath, value)}
          />
        </View>
      )
    },
    bool: (entry, part, index, formPath, valuePath) => {
      const value = getPath(valuePath, _.isBoolean, null)
      let selected = value === null ? null : value ? 0 : 1
      return (
        <ButtonGroup
          selectedIndex={selected}
          onPress={i => formSetPath(valuePath, i == 0)}
          buttons={['Yes', 'No']}
        />
      )
    },
    gender: (entry, part, index, formPath, valuePath) => {
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
    text: (entry, part, index, formPath, valuePath) => {
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
    'long-text': (entry, part, index, formPath, valuePath) => {
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
    number: (entry, part, index, formPath, valuePath) => {
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
    address: (entry, part, index, formPath, valuePath) => {
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
    'phone-number': (entry, part, index, formPath, valuePath) => {
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
    date: (entry, part, index, formPath, valuePath) => {
      const current_value = getPath(valuePath, _.isDate)
      let buttonStyle = {}
      if (!current_value) {
        buttonStyle = { backgroundColor: '#d5001c' }
      }
      if (Platform.OS == 'web') {
        return (
          <DateTimePicker
            clearIcon={null}
            value={current_value}
            onChange={date => {
              formSetPath(valuePath, date)
            }}
            disableClock={true}
            onCancel={() => {
              setDynamicState({
                ['isVisible_dateTime_' + valuePath]: false,
              })
              removeKeepAlive(valuePath)
            }}
          />
        )
      } else {
        let picker = (
          <DateTimePicker
            isVisible={dynamicState['isVisible_dateTime_' + valuePath]}
            value={current_value}
            mode="date"
            onConfirm={date => {
              formSetPath(valuePath, date)
              setDynamicState({
                ['isVisible_dateTime_' + valuePath]: false,
              })
              removeKeepAlive(valuePath)
            }}
            onCancel={() => {
              setDynamicState({
                ['isVisible_dateTime_' + valuePath]: false,
              })
              removeKeepAlive(valuePath)
            }}
          />
        )
        return (
          <>
            <Button
              title={
                current_value
                  ? current_value.toLocaleDateString()
                  : 'Choose date'
              }
              buttonStyle={buttonStyle}
              onPress={() => {
                addKeepAlive(valuePath)
                setDynamicState({ ['isVisible_dateTime_' + valuePath]: true })
              }}
            />
            {dynamicState['isVisible_dateTime_' + valuePath] ? picker : null}
          </>
        )
      }
    },
    'date-time': (entry, part, index, formPath, valuePath) => {
      const current_value = getPath(valuePath, _.isDate)
      let buttonStyle = {}
      if (!current_value) {
        buttonStyle = { backgroundColor: '#d5001c' }
      }
      if (Platform.OS == 'web') {
        return (
          <DateTimePicker
            clearIcon={null}
            value={current_value}
            onChange={date => {
              formSetPath(valuePath, date)
            }}
            onCancel={() => {
              setDynamicState({
                ['isVisible_dateTime_' + valuePath]: false,
              })
              removeKeepAlive(valuePath)
            }}
          />
        )
      } else {
        let picker = (
          <DateTimePicker
            isVisible={dynamicState['isVisible_dateTime_' + valuePath]}
            value={current_value}
            onConfirm={date => {
              formSetPath(valuePath, date)
              setDynamicState({
                ['isVisible_dateTime_' + valuePath]: false,
              })
              removeKeepAlive(valuePath)
            }}
            mode="datetime"
            onCancel={() => {
              setDynamicState({
                ['isVisible_dateTime_' + valuePath]: false,
              })
              removeKeepAlive(valuePath)
            }}
          />
        )
        return (
          <>
            <Button
              title={
                current_value
                  ? current_value.toLocaleString()
                  : 'Choose date and time'
              }
              buttonStyle={buttonStyle}
              onPress={() => {
                addKeepAlive(valuePath)
                setDynamicState({ ['isVisible_dateTime_' + valuePath]: true })
              }}
            />
            {dynamicState['isVisible_dateTime_' + valuePath] ? picker : null}
          </>
        )
      }
    },
    'list-with-parts': (entry, part, index, formPath, valuePath) => {
      // TODO
      return <></>
    },
    list: (entry, part, index, formPath, valuePath) => {
      // TODO
      return <></>
    },
    sex: (entry, part, index, formPath, valuePath) => {
      // TODO
      return <></>
    },
    photo: (entry, part, index, formPath, valuePath) => {
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
    'list-with-labels': (entry, part, index, formPath, valuePath) => {
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
