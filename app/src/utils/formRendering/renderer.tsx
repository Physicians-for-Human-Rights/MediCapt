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

import {
  Icon,
  Center,
  Divider,
  VStack,
  HStack,
  Text,
  Heading,
  ZStack,
  Box,
} from 'native-base'
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
import SkipButton from 'components/form-parts/SkipButton'
import { RenderCommand, URI } from 'utils/formRendering/types'
import { wrapCommandMemo } from 'utils/memo'

const CDebouncedTextInput = wrapCommandMemo(DebouncedTextInput)
const CButtonGroup = wrapCommandMemo(ButtonGroup)
const CBodyImage = wrapCommandMemo(BodyImage)
const CDateTimePicker = wrapCommandMemo(DateTimePicker)
const CList = wrapCommandMemo(List)
const CListSelectMultiple = wrapCommandMemo(ListSelectMultiple)
const CPhoto = wrapCommandMemo(Photo)
const CSignature = wrapCommandMemo(Signature)
const CCenter = wrapCommandMemo(Center)
const CCustomButton = wrapCommandMemo(CustomButton)
const CSkipButton = wrapCommandMemo(SkipButton)

import { disabled, disabledBackground } from 'utils/formRendering/utils'

export function renderCommand(
  command: RenderCommand,
  setPath: (path: RecordPath, value: any) => any,
  addKeepAlive: (n: string) => any,
  removeKeepAlive: (n: string) => any
) {
  switch (command.type) {
    case 'title':
      return (
        <CCenter
          bg={disabled(command, disabledBackground)}
          command={command}
          pt={4}
          pb={2}
        >
          <Heading
            italic={command.italic}
            size={command.size}
            fontWeight={command.fontWeight}
            maxW={command.maxW}
            px={2}
            color={disabled(command, 'coolGray.400')}
          >
            {command.title}
          </Heading>
        </CCenter>
      )
    case 'description':
      return (
        <Text bg={disabled(command, disabledBackground)} pb={2}>
          {command.description}
        </Text>
      )
    case 'divider':
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <Divider w={command.w} my={2} thickness={command.thickness} />
        </Center>
      )
    case 'skip':
      // NB isDisabled={false} means we always allow toggling skipping. If we
      // don't do this, we would need to change this to work like divider so that
      // it doesn't get stuck
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <CSkipButton
            command={command}
            isDisabled={false}
            skippable={true}
            skipped={command.skipped}
            toggleSkip={() => {
              setPath(command.skippedPath, !command.skipped)
            }}
            direction={command.direction}
          />
        </Center>
      )
    case 'address':
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <CDebouncedTextInput
            command={command}
            isDisabled={command.disable}
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
            accessibilityLabel={t('form.enter-address')}
          />
        </Center>
      )
    case 'body-image':
      return (
        <CBodyImage
          command={command}
          isDisabled={command.disable}
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
          bg={disabled(command, disabledBackground)}
          isDisabled={command.disable}
          selected={command.selected}
          options={{ [t('form.Yes')]: true, [t('form.No')]: false }}
          onPress={v => setPath(command.valuePath, v)}
          fullwidth={command.fullwidth}
          maxW={command.maxW}
          py={1}
          accessibilityLabel="yes-no buttons"
        />
      )
    case 'date':
      return (
        <CDateTimePicker
          command={command}
          isDisabled={command.disable}
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
          isDisabled={command.disable}
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
        <Center bg={disabled(command, disabledBackground)}>
          <CDebouncedTextInput
            command={command}
            isDisabled={command.disable}
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
            accessibilityLabel={t('form.enter-email')}
          />
        </Center>
      )
    case 'gender':
      return (
        <CButtonGroup
          command={command}
          bg={disabled(command, disabledBackground)}
          isDisabled={command.disable}
          selected={command.selected}
          options={command.options}
          onPress={v => setPath(command.valuePath, v)}
          fullwidth={command.fullwidth}
          maxW={command.maxW}
        />
      )
    case 'list':
      return (
        <CList
          command={command}
          isDisabled={command.disable}
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
          isDisabled={command.disable}
          values={command.values}
          otherChecked={command.otherChecked}
          otherText={command.otherText}
          options={command.options}
          other={command.other}
          togglePathValue={(idx: number) => {
            setPath(command.valuePaths[idx], !command.values[idx])
          }}
          toggleOtherChecked={() => {
            setPath(command.otherPath, !command.otherChecked)
          }}
          setOtherText={(s: string | undefined) => {
            command.other &&
              command.otherPathText &&
              setPath(command.otherPathText, s)
          }}
        />
      )
    case 'list-with-labels':
      return (
        <CList
          command={command}
          isDisabled={command.disable}
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
        <Center bg={disabled(command, disabledBackground)}>
          <CDebouncedTextInput
            command={command}
            isDisabled={command.disable}
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
            accessibilityLabel={t('form.enter-long-text')}
          />
        </Center>
      )
    case 'number':
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <CDebouncedTextInput
            command={command}
            isDisabled={command.disable}
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
            maxW={command.maxW}
            accessibilityLabel={t('form.enter-number')}
          />
        </Center>
      )
    case 'phone-number':
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <CDebouncedTextInput
            command={command}
            isDisabled={command.disable}
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
            maxW={command.maxW}
            accessibilityLabel={t('form.enter-phone-number')}
          />
        </Center>
      )
    case 'photo':
      return (
        <CPhoto
          command={command}
          isDisabled={command.disable}
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
          bg={disabled(command, disabledBackground)}
          isDisabled={command.disable}
          selected={command.value}
          options={command.options}
          onPress={v => setPath(command.valuePath, v)}
          fullwidth={command.fullwidth}
          maxW={command.maxW}
        />
      )
    case 'signature':
      return (
        <CSignature
          command={command}
          // @ts-ignore Why isn't TS happy here?
          isDisabled={command.disable}
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
        <Center bg={disabled(command, disabledBackground)}>
          <CDebouncedTextInput
            command={command}
            isDisabled={command.disable}
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
            maxW={command.maxW}
            accessibilityLabel={t('form.enter-text')}
          />
        </Center>
      )
    case 'add-repeat-button':
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <CCustomButton
            command={command}
            isDisabled={command.disable}
            key={command.key}
            text={'Add ' + _.lowerCase(command.title)}
            onPress={() => {
              setPath(
                command.repeatListPath,
                command.repeatList.concat(uuid.v4() as string)
              )
            }}
            mt={2}
            p={2}
            icon={<Icon as={MaterialIcons} name="add-box" size="sm" />}
            maxW="80%"
          />
        </Center>
      )
    case 'remove-repeat-button':
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <CCustomButton
            command={command}
            isDisabled={command.disable}
            key={command.key}
            text={'Remove ' + _.lowerCase(command.title)}
            onPress={() =>
              setPath(
                command.repeatListPath,
                _.difference(command.repeatList, [command.repeatId])
              )
            }
            mt={2}
            p={2}
            icon={<Icon as={MaterialIcons} name="delete" size="sm" />}
            maxW="80%"
          />
        </Center>
      )
    case 'padding':
      return (
        <Box px={command.padding} bg={disabled(command, disabledBackground)}>
          {renderCommand(
            command.contents,
            setPath,
            addKeepAlive,
            removeKeepAlive
          )}
        </Box>
      )
    case 'row':
      return (
        <HStack
          bg={disabled(command, disabledBackground)}
          justifyContent="space-between"
        >
          {renderCommand(command.left, setPath, addKeepAlive, removeKeepAlive)}
          {renderCommand(command.right, setPath, addKeepAlive, removeKeepAlive)}
        </HStack>
      )
    case 'row-with-description':
      return (
        <VStack bg={disabled(command, disabledBackground)}>
          <HStack
            justifyContent="space-between"
            bg={disabled(command, disabledBackground)}
          >
            {renderCommand(
              command.left,
              setPath,
              addKeepAlive,
              removeKeepAlive
            )}
            {renderCommand(
              command.right,
              setPath,
              addKeepAlive,
              removeKeepAlive
            )}
          </HStack>
          {renderCommand(
            command.description,
            setPath,
            addKeepAlive,
            removeKeepAlive
          )}
        </VStack>
      )
    default:
      console.log('Unknown render command', command)
  }
}
