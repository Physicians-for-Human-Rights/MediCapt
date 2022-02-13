import React, { useState, useEffect } from 'react'
import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  Center,
  Button,
  Pressable,
  Divider,
  Hidden,
  Square,
  Circle,
  Stack,
  Badge,
  Image,
  View,
  Input,
  InputGroup,
  InputLeftAddon,
  CheckIcon,
  CloseIcon,
  Popover,
  ScrollView,
  FlatList,
  IconButton,
} from 'native-base'
import { FormType } from 'utils/formTypes'
import yaml from 'js-yaml'
import { useWindowDimensions } from 'react-native'
import useDebounce from 'react-use/lib/useDebounce'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import DashboardLayout from 'components/DashboardLayout'
import Form from 'components/Form'
import {
  RootStackScreenProps,
  RootStackParamList,
} from 'utils/formDesigner/navigation'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import useMap from 'react-use/lib/useMap'
import * as FileSystem from 'expo-file-system'
import { isImage, readImage } from 'utils/forms'
import _ from 'lodash'
import NecessaryItem from 'components/NecessaryItem'

import { Button as NButton, Image as NImage, View as NView } from 'react-native'

export default function FormEditorFiles({
  fileCache,
  setFileCache,
  files,
  setFile,
  form,
  setForm,
  removeFile,
}: {
  fileCache: Record<string, string>
  setFileCache: (k: string, v: string) => void
  files: Record<string, any>
  setFile: (k: string, v: any) => void
  removeFile: (k: string) => void
  form: FormType
  setForm: React.Dispatch<React.SetStateAction<FormType>>
}) {
  const [image, setImage] = useState(null)

  const pickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      multiple: true,
      copyToCacheDirectory: true,
    })
    if (result.type !== 'cancel') {
      const data = await readImage(result.uri, 'data:application/pdf,')
      if (data) {
        setFile('form.pdf', data)
        setFileCache('form.pdf', data)
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
      let nr = _.size(files)
      for (const uploaded of result.selected) {
        setFile('image' + nr + '.png', uploaded.uri)
        setFileCache('image' + nr + '.png', uploaded.uri)
        nr++
      }
    }
  }

  const removePdf = () => {
    removeFile('form.pdf')
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
          {'form.pdf' in files ? (
            <Button
              fontWeight="bold"
              color="coolGray.800"
              bg="info.500"
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
        {'form.pdf' in files ? (
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
            <Button
              fontWeight="bold"
              color="coolGray.800"
              bg="info.500"
              fontSize="md"
            >
              Download pdf (TODO)
            </Button>
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
            data={_.map(
              _.pickBy(files, (_v, k) => isImage(k)),
              (data, filename) => {
                return { filename, data }
              }
            )}
            renderItem={({ item }) => (
              <VStack m={1} borderRadius="md" key={item.filename}>
                <Image
                  borderWidth={1}
                  borderColor="coolGray.200"
                  width="200px"
                  height="200px"
                  rounded="lg"
                  alt="Uploaded image"
                  source={item.data}
                  resizeMode="contain"
                />
                <InputGroup w="200px" maxWidth="200px" my={3}>
                  <Input
                    value={item.filename}
                    w="100%"
                    InputRightElement={
                      <IconButton
                        icon={
                          <Icon
                            as={MaterialCommunityIcons}
                            name="delete-forever"
                          />
                        }
                        borderRadius="full"
                        onPress={() => removeFile(item.filename)}
                      />
                    }
                  />
                </InputGroup>
              </VStack>
            )}
            keyExtractor={(item, index) => 'key' + index}
          />
        </Box>
      </VStack>
    </VStack>
  )
}
