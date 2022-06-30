import _ from 'lodash'
import { RecordValuePath, RecordValue } from 'utils/types/record'
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
// @ts-ignore TODO TS doesn't understand .native.tsx and .web.tsx files
import Signature from '../../components/Signature'
import { List, ListSelectMultiple } from 'components/form-parts/List'
import ButtonGroup from 'components/form-parts/ButtonGroup'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import Photo from 'components/form-parts/Photo'
import BodyImage, { ImageAnnotation } from 'components/form-parts/BodyImage'
import CustomButton from 'components/form-parts/Button'
import SkipButton from 'components/form-parts/SkipButton'

import { RenderCommand } from 'utils/formRendering/types'
import { disabled, disabledBackground } from 'utils/formRendering/utils'
import { FormPartMap } from 'utils/types/form'
import { sha256 } from 'utils/manifests'
import { unDataURI } from 'utils/data'
// @ts-ignore TODO TS doesn't understand .native.js and .web.js files
import { tryConvertToWebP } from 'utils/imageConverter'
import { wrapCommandMemo } from 'utils/memo'
import { RecordMetadata } from 'utils/types/recordMetadata'

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

export function renderCommand(
  command: RenderCommand,
  setPath: (path: RecordValuePath, value: RecordValue) => void,
  recordMetadataRef: React.MutableRefObject<RecordMetadata | undefined>,
  setRecordMetadata: (r: RecordMetadata) => void,
  addPhotoToManifest: (uri: string) => any,
  removePhotoFromManifest: (sha256: string) => any,
  addKeepAlive: (n: string) => void,
  removeKeepAlive: (n: string) => void
) {
  switch (command.type) {
    case 'title':
      return (
        <CCenter
          command={command}
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
            color={disabled(command, 'coolGray.600') || command.color}
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
          <CDebouncedTextInput
            command={command}
            isDisabled={command.disable}
            onChangeText={text => {
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'address',
                value: text,
              })
              if (
                recordMetadataRef.current &&
                command.recordSummary === 'patient-address'
              ) {
                setRecordMetadata({
                  ...recordMetadataRef.current,
                  patientAddress: text,
                })
              }
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
      if (!command.image) {
        return (
          <Text pb={2}>
            You must select a gender or sex before this body image will appear
          </Text>
        )
      }
      return (
        <CBodyImage
          command={command}
          isDisabled={command.disable}
          image={command.image}
          annotations={command.imageAnnotations}
          addAnnotation={async (
            annotation: ImageAnnotation,
            index: number | null
          ) => {
            const recordAnnotation = {
              ...annotation,
              photos: await Promise.all(
                _.map(annotation.photos, async photo => {
                  const imageUri = await tryConvertToWebP(photo.uri)
                  addPhotoToManifest(imageUri)
                  return {
                    'date-taken': photo['date-taken'],
                    sha256: sha256(unDataURI(imageUri), true),
                  }
                })
              ),
            }
            let newAnnotations = [
              ...(command.recordValue?.value.annotations || []),
            ]
            if (index !== null) {
              newAnnotations.splice(index, 1, recordAnnotation)
            } else {
              newAnnotations = newAnnotations.concat(recordAnnotation)
            }

            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'body-image',
              value: {
                imageHash: sha256(unDataURI(command.image), true),
                annotations: newAnnotations,
              },
            })
          }}
          removeAnnotation={(n: number) => {
            const annotations = command.recordValue?.value.annotations

            if (!annotations)
              throw Error("Can't remove annotations since none exist.")

            _.forEach(annotations[n].photos, photo =>
              removePhotoFromManifest(photo.sha256)
            )

            const array = _.cloneDeep(annotations)
            _.pullAt(array, [n])
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'body-image',
              value: {
                imageHash: sha256(unDataURI(command.image), true),
                annotations: array,
              },
            })
          }}
        />
      )
    }
    case 'bool':
      return (
        <CButtonGroup
          command={command}
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
        <CDateTimePicker
          command={command}
          //@ts-ignore
          isDisabled={command.disable}
          title={command.title}
          date={command.recordValue?.value}
          open={() => addKeepAlive(_.join(command.valuePath, '.'))}
          close={() => removeKeepAlive(_.join(command.valuePath, '.'))}
          setDate={(date: Date) => {
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'date',
              value: date,
            })
            if (
              recordMetadataRef.current &&
              command.recordSummary === 'incident-date'
            ) {
              setRecordMetadata({
                ...recordMetadataRef.current,
                incidentDate: date,
              })
            }
            if (
              recordMetadataRef.current &&
              command.recordSummary === 'patient-date-of-birth'
            ) {
              setRecordMetadata({
                ...recordMetadataRef.current,
                patientDateOfBirth: date,
              })
            }
          }}
        />
      )
    case 'date-time':
      return (
        <CDateTimePicker
          command={command}
          //@ts-ignore
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
          <CDebouncedTextInput
            command={command}
            isDisabled={command.disable}
            onChangeText={text => {
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'email',
                value: text,
              })
              if (
                recordMetadataRef.current &&
                command.recordSummary === 'patient-email'
              ) {
                setRecordMetadata({
                  ...recordMetadataRef.current,
                  patientEmail: text,
                })
              }
            }}
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
        <CButtonGroup
          command={command}
          bg={disabled(command, disabledBackground)}
          isDisabled={command.disable}
          selected={command.recordValue?.value || ''}
          options={command.options}
          onPress={v => {
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'gender',
              value: v as string,
            })
            if (
              recordMetadataRef.current &&
              command.recordSummary === 'patient-gender'
            ) {
              setRecordMetadata({
                ...recordMetadataRef.current,
                patientGender: v as string,
              })
            }
          }}
          fullwidth={command.fullwidth}
          maxW={command.maxW}
        />
      )
    case 'list': {
      const listValue = command.recordValue?.value
      const selection = listValue ? listValue.selection : null
      const otherValue = listValue ? listValue.otherValue : null
      return (
        <CList
          command={command}
          isDisabled={command.disable}
          options={command.options}
          value={selection}
          onSelect={selection =>
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'list',
              value: {
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
        <CList
          command={command}
          isDisabled={command.disable}
          withLabels
          options={command.options}
          value={selection}
          onSelect={selection =>
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'list-with-labels',
              value: {
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
      const options = command.options
      const selections =
        previousRecordValue?.selections || _.times(options.length, () => false)

      return (
        <CListSelectMultiple
          command={command}
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
      const options = command.options
      const selections =
        previousRecordValue?.selections || _.times(options.length, () => false)

      return (
        <CListSelectMultiple
          command={command}
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
      const options = _.filter(
        _.map(command.options, (formPartMap: FormPartMap) => {
          const formPart = formPartMap[Object.keys(formPartMap)[0]]
          return 'title' in formPart ? formPart.title : ''
        }),
        optionId => optionId !== ''
      )
      const selections =
        previousRecordValue?.selections || _.times(options.length, () => false)
      return (
        <CListSelectMultiple
          command={command}
          isDisabled={command.disable}
          options={options}
          values={selections}
          togglePathValue={(idx: number) => {
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'list-with-parts',
              value: {
                ...previousRecordValue,
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
          <CDebouncedTextInput
            command={command}
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
          <CDebouncedTextInput
            command={command}
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
          <CDebouncedTextInput
            command={command}
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
    case 'photo': {
      const recordPhotos = command.recordValue?.value || []
      return (
        <CPhoto
          command={command}
          isDisabled={command.disable}
          photos={command.photos}
          addPhoto={async ({ uri, 'date-taken': dateTaken }) => {
            const imageUri = await tryConvertToWebP(uri)
            addPhotoToManifest(imageUri)
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'photo',
              value: _.concat(recordPhotos, {
                sha256: sha256(unDataURI(imageUri), true),
                'date-taken': dateTaken,
              }),
            })
          }}
          removePhoto={(n: number) => {
            removePhotoFromManifest(recordPhotos[n].sha256)
            setPath(command.valuePath, {
              ...command.recordValue,
              type: 'photo',
              value: _.filter(recordPhotos, (_, i) => i !== n),
            })
          }}
        />
      )
    }
    case 'sex':
      return (
        <CButtonGroup
          command={command}
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
        <CSignature
          command={command}
          //@ts-ignore
          isDisabled={command.disable}
          imageURI={command.imageUri}
          open={() => {
            addKeepAlive(_.join(command.valuePath, '.'))
          }}
          close={() => {
            removeKeepAlive(_.join(command.valuePath, '.'))
          }}
          setSignature={async (signatureUri: string | undefined) => {
            if (signatureUri) {
              const imageUri: string = await tryConvertToWebP(signatureUri)
              addPhotoToManifest(imageUri)
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'signature',
                value: {
                  'date-signed': new Date(),
                  sha256: sha256(unDataURI(imageUri), true),
                },
              })
            } else if (command.recordValue?.value.sha256) {
              const previousHash = command.recordValue.value.sha256
              removePhotoFromManifest(previousHash)
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'signature',
                value: {},
              })
            }
          }}
        />
      )
    case 'text':
      return (
        <Center bg={disabled(command, disabledBackground)}>
          <CDebouncedTextInput
            command={command}
            isDisabled={command.disable}
            onChangeText={text => {
              setPath(command.valuePath, {
                ...command.recordValue,
                type: 'text',
                value: text,
              })
              if (
                recordMetadataRef.current &&
                command.recordSummary === 'patient-name'
              ) {
                setRecordMetadata({
                  ...recordMetadataRef.current,
                  patientName: text,
                })
              }
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
          <CCustomButton
            command={command}
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
          <CCustomButton
            command={command}
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
            recordMetadataRef,
            setRecordMetadata,
            addPhotoToManifest,
            removePhotoFromManifest,
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
          {renderCommand(
            command.left,
            setPath,
            recordMetadataRef,
            setRecordMetadata,
            addPhotoToManifest,
            removePhotoFromManifest,
            addKeepAlive,
            removeKeepAlive
          )}
          {renderCommand(
            command.right,
            setPath,
            recordMetadataRef,
            setRecordMetadata,
            addPhotoToManifest,
            removePhotoFromManifest,
            addKeepAlive,
            removeKeepAlive
          )}
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
              recordMetadataRef,
              setRecordMetadata,
              addPhotoToManifest,
              removePhotoFromManifest,
              addKeepAlive,
              removeKeepAlive
            )}
            {renderCommand(
              command.right,
              setPath,
              recordMetadataRef,
              setRecordMetadata,
              addPhotoToManifest,
              removePhotoFromManifest,
              addKeepAlive,
              removeKeepAlive
            )}
          </HStack>
          {renderCommand(
            command.description,
            setPath,
            recordMetadataRef,
            setRecordMetadata,
            addPhotoToManifest,
            removePhotoFromManifest,
            addKeepAlive,
            removeKeepAlive
          )}
        </VStack>
      )
    default:
      console.error('Unknown render command', command)
      return null
  }
}
