import React, { useState } from 'react'
import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  Center,
  Button,
  Divider,
  Badge,
  Image,
  Input,
  InputGroup,
  Popover,
  FlatList,
  IconButton,
} from 'native-base'
import { FormType } from 'utils/types/form'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { readImage, stripFileExtension } from 'utils/forms'
import _ from 'lodash'
import NecessaryItem from 'components/NecessaryItem'
// @ts-ignore TODO TS doesn't understand .native.js and .web.js files
import { convertToWebP } from 'utils/imageConverter'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
import {
  isImage,
  isInManifest,
  filterManifest,
  mapManifest,
  addFileToManifest,
  makeManifestEntry,
  changeFilenameInManifest,
} from 'utils/manifests'

export default function FormEditorFiles({
  formMetadata,
  setFormMetadata,
  manifest,
  setManifest,
}: {
  formMetadata: Partial<FormMetadata>
  setFormMetadata: React.Dispatch<React.SetStateAction<Partial<FormMetadata>>>
  manifest: FormManifestWithData
  setManifest: React.Dispatch<React.SetStateAction<FormManifestWithData>>
}) {
  const pickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      multiple: true,
      copyToCacheDirectory: true,
    })
    if (result.type !== 'cancel') {
      const data = await readImage(result.uri, 'data:application/pdf,')
      if (data) {
        if (_.isArrayBuffer(data))
          throw new Error('BUG: You can only add array buffers')
        setManifest(
          addFileToManifest(
            filterManifest(manifest, f => f.filename !== 'form.pdf'),
            data,
            'form.pdf',
            'application/pdf',
            true
          )
        )
      }
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      base64: true,
      quality: 0.8,
    })
    if (!result.cancelled) {
      // TODO It doesn't seem like we can get file names :(
      let nr = _.size(manifest.contents)
      for (const uploaded of result.selected) {
        setManifest(
          addFileToManifest(
            manifest,
            await convertToWebP(uploaded.uri),
            'image' + nr + '.webp',
            'image/webp',
            true
          )
        )
        nr++
      }
    }
  }

  const removePdf = () => {
    setManifest(filterManifest(manifest, f => f.filename !== 'form.pdf'))
  }

  const pdfHasAnnotations = false

  return (
    <VStack my="2" space={3}>
      <HStack alignItems="center" justifyContent="space-between">
        <VStack space="4" justifyContent="flex-start" py={4} w="200" maxW="200">
          <Center>
            <Badge
              variant="solid"
              bg="red.400"
              alignSelf="flex-start"
              _text={{
                color: 'coolGray.50',
                fontWeight: 'bold',
                fontSize: 'xs',
              }}
            >
              MAIN FORM PDF
            </Badge>
          </Center>
          {isInManifest(manifest, e => e.filename == 'form.pdf') ? (
            <Button
              fontWeight="bold"
              color="coolGray.800"
              bg="red.500"
              fontSize="md"
              onPress={removePdf}
            >
              Remove pdf
            </Button>
          ) : (
            <Button
              fontWeight="bold"
              color="coolGray.800"
              bg="info.500"
              fontSize="md"
              onPress={pickPdf}
            >
              Upload an annotated pdf
            </Button>
          )}
        </VStack>
        {isInManifest(manifest, e => e.filename == 'form.pdf') ? (
          <VStack
            space="2"
            px={{ base: '4', md: '8' }}
            justifyContent="flex-end"
          >
            <HStack w="100%" space={3} alignItems="center">
              <NecessaryItem
                isDone={pdfHasAnnotations}
                todoText="PDF has no annotations!"
                doneText="PDF has annotations"
                size={4}
                optional={false}
              />
              <Popover
                trigger={triggerProps => {
                  return (
                    <Button
                      {...triggerProps}
                      variant="link"
                      colorScheme="secondary"
                    >
                      Tell me more
                    </Button>
                  )
                }}
              >
                <Popover.Content accessibilityLabel="Delete Customerd" w="64">
                  <Popover.Arrow />
                  <Popover.CloseButton />
                  <Popover.Header>Annotating pdfs</Popover.Header>
                  <Popover.Body>
                    TODO Describe how to annotate a pdf in Acrobat and how to
                    fill it out with Xs
                  </Popover.Body>
                </Popover.Content>
              </Popover>
            </HStack>
          </VStack>
        ) : (
          <Text maxW="300" w="300" isTruncated noOfLines={3}>
            TODO Instructions for what to upload and how to annoate
          </Text>
        )}
      </HStack>
      <Divider py="0.1" bg="coolGray.200" />
      <VStack my="2">
        <HStack space={3}>
          <Center>
            <Badge
              variant="solid"
              bg="red.400"
              alignSelf="flex-start"
              _text={{
                color: 'coolGray.50',
                fontWeight: 'bold',
                fontSize: 'xs',
              }}
            >
              IMAGES
            </Badge>
          </Center>
          <Button
            fontWeight="bold"
            color="coolGray.800"
            bg="info.500"
            fontSize="md"
            onPress={pickImage}
          >
            Upload an image
          </Button>
        </HStack>
        <Box
          p={{ md: '3' }}
          justifyContent="center"
          alignItems={{ md: 'center' }}
        >
          <FlatList
            mb={{ base: 0, md: 20 }}
            mt={{ base: '2' }}
            display={{ md: 'flex' }}
            horizontal={false}
            numColumns={3}
            data={filterManifest(manifest, isImage).contents}
            renderItem={({ item }) => (
              <VStack m={1} borderRadius="md" key={item.filename}>
                <Image
                  borderWidth={1}
                  borderColor="coolGray.200"
                  width="200px"
                  height="200px"
                  rounded="lg"
                  alt="Uploaded image"
                  // @ts-ignore TODO Fix this
                  source={item.data}
                  resizeMode="contain"
                />
                <HStack w="200px" maxWidth="200px" my={3}>
                  <DebouncedTextInput
                    w={{ md: '100%', lg: '100%', base: '100%' }}
                    bg="white"
                    size="lg"
                    color="black"
                    debounceMs={1000}
                    value={stripFileExtension(item.filename)}
                    onChangeText={t =>
                      setManifest(
                        changeFilenameInManifest(manifest, item.sha256, t)
                      )
                    }
                  />
                  <IconButton
                    icon={
                      <Icon as={MaterialCommunityIcons} name="delete-forever" />
                    }
                    borderRadius="full"
                    onPress={() =>
                      setManifest(
                        filterManifest(
                          manifest,
                          e => item.filename !== e.filename
                        )
                      )
                    }
                  />
                </HStack>
              </VStack>
            )}
            keyExtractor={(item, index) => 'key' + index}
          />
        </Box>
      </VStack>
    </VStack>
  )
}
