import _ from 'lodash'
import {
  RecordValuePath,
  RecordValue,
  ImageAnnotation,
  RecordPhoto,
} from 'utils/types/record'
import React from 'react'
import { t } from 'i18n-js'
import { MaterialIcons } from '@expo/vector-icons'
import uuid from 'react-native-uuid'

import {
  Icon,
  Center,
  Divider,
  VStack,
  HStack,
  Text,
  Heading,
  Box,
} from 'native-base'
// @ts-ignore TODO TS doesn't understand .native.tsx and .web.tsx files
import DateTimePicker from 'components/DateTimePicker'
// @ts-ignore typescript doesn't like platform-specific modules
import Signature from 'components/Signature'
import { List, ListSelectMultiple } from 'components/form-parts/List'
import ButtonGroup from 'components/form-parts/ButtonGroup'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import Photo from 'components/form-parts/Photo'
import BodyImage from 'components/form-parts/BodyImage'
import CustomButton from 'components/form-parts/Button'
import SkipButton from 'components/form-parts/SkipButton'

import { RenderCommand } from 'utils/formRendering/types'
// import { wrapCommandMemo } from 'utils/memo'

// const CDebouncedTextInput = wrapCommandMemo(DebouncedTextInput)
// const CButtonGroup = wrapCommandMemo(ButtonGroup)
// const CBodyImage = wrapCommandMemo(BodyImage)
// const CDateTimePicker = wrapCommandMemo(DateTimePicker)
// const CList = wrapCommandMemo(List)
// const CListSelectMultiple = wrapCommandMemo(ListSelectMultiple)
// const CPhoto = wrapCommandMemo(Photo)
// const CSignature = wrapCommandMemo(Signature)
// const CCenter = wrapCommandMemo(Center)
// const CCustomButton = wrapCommandMemo(CustomButton)
// const CSkipButton = wrapCommandMemo(SkipButton)

import { disabled, disabledBackground } from 'utils/formRendering/utils'
import { FormPartMap } from 'utils/types/form'

export function renderCommand(
  command: RenderCommand,
  setPath: (path: RecordValuePath, value: RecordValue) => void,
  addKeepAlive: (n: string) => void,
  removeKeepAlive: (n: string) => void
) {
  switch (command.type) {
    case 'title':
      return (
        <Center
          // command={command}
          bg={disabled(command, disabledBackground)}
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
        </Center>
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
          <SkipButton
            // command={command}
            isDisabled={false}
            skippable={true}
            skipped={command.value?.skipped || false}
            toggleSkip={() => {
              const skipped = command.value?.skipped || false
              setPath(command.valuePath, {
                ...command.value,
                skipped: !skipped,
              })
            }}
            direction={command.direction}
          />
        </Center>
      )
    case 'address':
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <DebouncedTextInput
            // command={command}
            isDisabled={command.disable}
            onChangeText={text => {
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'address',
                value: text,
              })
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
            value={command.recordValue?.value}
            accessibilityLabel={t('form.enter-address')}
          />
        </Center>
      )
    case 'body-image': {
      const image = command.recordValue?.value?.uri || command.formImage
      const annotations = command.recordValue?.value?.annotations || []
      return (
        <BodyImage
          // command={command}
          isDisabled={command.disable}
          imageURI={image}
          annotations={annotations}
          addMarkerData={(toAdd: ImageAnnotation, index: number | null) => {
            let array = _.cloneDeep(annotations)
            if (index !== null) {
              array.splice(index, 1, toAdd)
            } else {
              array = array.concat(toAdd)
            }
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'body-image',
              value: {
                uri: image,
                annotations: array,
              },
            })
          }}
          removeMarkerData={(n: number) => {
            const array = _.cloneDeep(annotations)
            _.pullAt(array, [n])
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'body-image',
              value: {
                uri: image,
                annotations: array,
              },
            })
          }}
        />
      )
    }
    case 'bool':
      return (
        <ButtonGroup
          // command={command}
          bg={disabled(command, disabledBackground)}
          isDisabled={command.disable}
          selected={command.recordValue?.value}
          options={{ [t('form.Yes')]: true, [t('form.No')]: false }}
          onPress={v =>
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'bool',
              value: v as boolean,
            })
          }
          fullwidth={command.fullwidth}
          maxW={command.maxW}
          py={1}
          accessibilityLabel="yes-no buttons"
        />
      )
    case 'date':
      return (
        <DateTimePicker
          // command={command}
          isDisaxbled={command.disable}
          title={command.title}
          date={command.recordValue?.value}
          open={() => addKeepAlive(_.join(command.valuePath, '.'))}
          close={() => removeKeepAlive(_.join(command.valuePath, '.'))}
          setDate={(date: Date) =>
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'date',
              value: date,
            })
          }
        />
      )
    case 'date-time':
      return (
        <DateTimePicker
          // command={command}
          isDisabled={command.disable}
          title={command.title}
          date={command.recordValue?.value}
          open={() => addKeepAlive(_.join(command.valuePath, '.'))}
          close={() => removeKeepAlive(_.join(command.valuePath, '.'))}
          setDate={(date: Date) =>
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'date-time',
              value: date,
            })
          }
          time
        />
      )
    case 'email':
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <DebouncedTextInput
            // command={command}
            isDisabled={command.disable}
            onChangeText={text =>
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'email',
                value: text,
              })
            }
            debounceMs={500}
            size="md"
            bg="coolGray.100"
            variant="filled"
            w="100%"
            textAlign="center"
            textContentType="emailAddress"
            keyboardType="email-address"
            placeholder={command.placeholder}
            value={command.recordValue?.value || ''}
            accessibilityLabel={t('form.enter-email')}
          />
        </Center>
      )
    case 'gender':
      return (
        <ButtonGroup
          // command={command}
          bg={disabled(command, disabledBackground)}
          isDisabled={command.disable}
          selected={command.recordValue?.value || ''}
          options={command.options}
          onPress={v =>
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'gender',
              value: v as string,
            })
          }
          fullwidth={command.fullwidth}
          maxW={command.maxW}
        />
      )
    case 'list': {
      const listValue = command.recordValue?.value
      const selection = listValue ? listValue.selection : null
      const otherValue = listValue ? listValue.otherValue : null
      return (
        <List
          // command={command}
          isDisabled={command.disable}
          options={command.options}
          value={selection}
          onSelect={selection =>
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'list',
              value: {
                options: command.options,
                selection,
                otherValue: null,
              },
            })
          }
          other={command.other}
          otherValue={otherValue}
          onOtherValue={otherValue =>
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'list',
              value: {
                options: command.options,
                selection: null,
                otherValue,
              },
            })
          }
        />
      )
    }
    case 'list-with-labels': {
      const listValue = command.recordValue?.value
      const selection = listValue ? listValue.selection : null
      const otherValue = listValue ? listValue.otherValue : null
      return (
        <List
          // command={command}
          isDisabled={command.disable}
          withLabels
          options={command.options}
          value={selection}
          onSelect={selection =>
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'list-with-labels',
              value: {
                options: command.options,
                selection,
                otherValue: null,
              },
            })
          }
          other={command.other}
          otherValue={otherValue}
          onOtherValue={otherValue =>
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'list-with-labels',
              value: {
                options: command.options,
                selection: null,
                otherValue,
              },
            })
          }
        />
      )
    }
    case 'list-multiple': {
      const previousRecordValue = command.recordValue?.value
      const options = previousRecordValue?.options || command.options
      const selections =
        previousRecordValue?.selections || _.times(options.length, () => false)

      return (
        <ListSelectMultiple
          // command={command}
          isDisabled={command.disable}
          options={command.options}
          values={selections}
          other={command.other}
          otherChecked={!!previousRecordValue?.otherChecked}
          otherText={previousRecordValue?.otherValue}
          togglePathValue={(idx: number) => {
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'list-multiple',
              value: {
                ...previousRecordValue,
                options,
                selections: _.concat(
                  _.slice(selections, 0, idx),
                  !selections[idx],
                  _.slice(selections, idx + 1)
                ),
              },
            })
          }}
          toggleOtherChecked={() => {
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'list-multiple',
              value: {
                ...previousRecordValue,
                options,
                selections,
                otherChecked: !previousRecordValue?.otherChecked,
              },
            })
          }}
          setOtherText={(otherValue: string | undefined) => {
            if (otherValue) {
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'list-multiple',
                value: {
                  ...previousRecordValue,
                  options,
                  selections,
                  otherValue,
                },
              })
            }
          }}
        />
      )
    }
    case 'list-with-labels-multiple': {
      const previousRecordValue = command.recordValue?.value
      const options = previousRecordValue?.options || command.options
      const selections =
        previousRecordValue?.selections || _.times(options.length, () => false)

      return (
        <ListSelectMultiple
          // command={command}
          isDisabled={command.disable}
          options={command.options.map(({ key, value }) => `${key} (${value})`)}
          values={selections}
          other={command.other}
          otherChecked={!!previousRecordValue?.otherChecked}
          otherText={previousRecordValue?.otherValue}
          togglePathValue={(idx: number) => {
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'list-with-labels-multiple',
              value: {
                ...previousRecordValue,
                options,
                selections: _.concat(
                  _.slice(selections, 0, idx),
                  !selections[idx],
                  _.slice(selections, idx + 1)
                ),
              },
            })
          }}
          toggleOtherChecked={() => {
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'list-with-labels-multiple',
              value: {
                ...previousRecordValue,
                options,
                selections,
                otherChecked: !previousRecordValue?.otherChecked,
              },
            })
          }}
          setOtherText={(otherValue: string | undefined) => {
            if (otherValue) {
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'list-with-labels-multiple',
                value: {
                  ...previousRecordValue,
                  options,
                  selections,
                  otherValue,
                },
              })
            }
          }}
        />
      )
    }
    case 'list-with-parts': {
      const previousRecordValue = command.recordValue?.value
      const options =
        previousRecordValue?.options ||
        _.filter(
          _.map(command.options, (formPartMap: FormPartMap) => {
            const formPart = formPartMap[Object.keys(formPartMap)[0]]
            return 'title' in formPart ? formPart.title : ''
          }),
          optionId => optionId !== ''
        )
      const selections =
        previousRecordValue?.selections || _.times(options.length, () => false)
      return (
        <ListSelectMultiple
          // command={command}
          isDisabled={command.disable}
          options={options}
          values={selections}
          togglePathValue={(idx: number) => {
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'list-with-parts',
              value: {
                ...previousRecordValue,
                options,
                selections: _.concat(
                  _.slice(selections, 0, idx),
                  !selections[idx],
                  _.slice(selections, idx + 1)
                ),
              },
            })
          }}
          toggleOtherChecked={() => {
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'list-with-parts',
              value: {
                ...previousRecordValue,
                options,
                selections,
                otherChecked: !previousRecordValue?.otherChecked,
              },
            })
          }}
          setOtherText={(otherValue: string | undefined) => {
            if (otherValue) {
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'list-with-parts',
                value: {
                  ...previousRecordValue,
                  options,
                  selections,
                  otherValue,
                },
              })
            }
          }}
        />
      )
    }
    case 'long-text':
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <DebouncedTextInput
            // command={command}
            isDisabled={command.disable}
            onChangeText={text => {
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'long-text',
                value: text,
              })
            }}
            debounceMs={500}
            placeholder={command.placeholder}
            size="md"
            bg="coolGray.100"
            variant="filled"
            w="100%"
            multiline={true}
            numberOfLines={command.numberOfLines}
            value={command.recordValue?.value || ''}
            accessibilityLabel={t('form.enter-long-text')}
          />
        </Center>
      )
    case 'number':
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <DebouncedTextInput
            // command={command}
            isDisabled={command.disable}
            onChangeText={text => {
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'number',
                value: text,
              })
            }}
            debounceMs={500}
            placeholder={command.placeholder}
            size="md"
            bg="coolGray.100"
            variant="filled"
            w="100%"
            textAlign="center"
            keyboardType="numeric"
            value={command.recordValue?.value || ''}
            maxW={command.maxW}
            accessibilityLabel={t('form.enter-number')}
          />
        </Center>
      )
    case 'phone-number':
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <DebouncedTextInput
            // command={command}
            isDisabled={command.disable}
            onChangeText={text => {
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'phone-number',
                value: text,
              })
            }}
            debounceMs={500}
            size="md"
            bg="coolGray.100"
            variant="filled"
            w="100%"
            textAlign="center"
            textContentType="telephoneNumber"
            keyboardType="phone-pad"
            value={command.recordValue?.value || ''}
            maxW={command.maxW}
            accessibilityLabel={t('form.enter-phone-number')}
          />
        </Center>
      )
    case 'photo':
      const photos = command.recordValue?.value || []
      return (
        <Photo
          // command={command}
          isDisabled={command.disable}
          photos={photos}
          addPhoto={(toAdd: RecordPhoto) => {
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'photo',
              value: photos.concat(toAdd),
            })
          }}
          removePhoto={(n: number) => {
            const array = _.cloneDeep(photos)
            _.pullAt(array, [n])
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'photo',
              value: array,
            })
          }}
        />
      )
    case 'sex':
      return (
        <ButtonGroup
          // command={command}
          bg={disabled(command, disabledBackground)}
          isDisabled={command.disable}
          selected={command.recordValue?.value || ''}
          options={command.options}
          onPress={v =>
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'sex',
              value: v as string,
            })
          }
          fullwidth={command.fullwidth}
          maxW={command.maxW}
        />
      )
    case 'signature':
      return (
        <Signature
          command={command}
          isDisabled={command.disable}
          imageURI={command.recordValue?.value}
          open={() => {
            addKeepAlive(_.join(command.valuePath, '.'))
          }}
          close={() => {
            removeKeepAlive(_.join(command.valuePath, '.'))
          }}
          setSignature={(signature: string) =>
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'signature',
              value: signature,
            })
          }
        />
      )
    case 'text':
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <DebouncedTextInput
            // command={command}
            isDisabled={command.disable}
            onChangeText={text => {
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'text',
                value: text,
              })
            }}
            debounceMs={500}
            placeholder={command.placeholder}
            size="md"
            bg="coolGray.100"
            variant="filled"
            w="100%"
            textAlign="center"
            value={command.recordValue?.value || ''}
            maxW={command.maxW}
            accessibilityLabel={t('form.enter-text')}
          />
        </Center>
      )
    case 'add-repeat-button': {
      const repeatList =
        command.recordValue?.value ||
        (command.partRepeated === 'at-least-one' ? ['at-least-one'] : [])
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <CustomButton
            // command={command}
            isDisabled={command.disable}
            key={command.key}
            text={'Add ' + _.lowerCase(command.title)}
            onPress={() => {
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'repeat-list',
                value: repeatList.concat(uuid.v4() as string),
              })
            }}
            mt={2}
            p={2}
            icon={<Icon as={MaterialIcons} name="add-box" size="sm" />}
            maxW="80%"
          />
        </Center>
      )
    }
    case 'remove-repeat-button': {
      const repeatList =
        command.recordValue?.value ||
        (command.partRepeated === 'at-least-one' ? ['at-least-one'] : [])
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <CustomButton
            // command={command}
            isDisabled={command.disable}
            key={command.key}
            text={'Remove ' + _.lowerCase(command.title)}
            onPress={() =>
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'repeat-list',
                value: _.difference(repeatList, [command.repeatId]),
              })
            }
            mt={2}
            p={2}
            icon={<Icon as={MaterialIcons} name="delete" size="sm" />}
            maxW="80%"
          />
        </Center>
      )
    }
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
      return null
  }
}
