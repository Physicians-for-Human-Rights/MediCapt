import React, { useState } from 'react'
import {
  HStack,
  VStack,
  Center,
  Divider,
  Badge,
  Image,
  FlatList,
  IconButton,
} from 'native-base'
import { View, Dimensions } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { readImage, stripFileExtension } from 'utils/forms'
import _ from 'lodash'
import NecessaryItem from 'components/NecessaryItem'
import { Feather } from '@expo/vector-icons'
// @ts-ignore TODO TS doesn't understand .native.js and .web.js files
import { tryConvertToWebP } from 'utils/imageConverter'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
import {
  isImage,
  isInManifest,
  filterManifest,
  addFileToManifest,
  changeFilenameInManifest,
  generateZip,
} from 'utils/manifests'
import styles, { spacing } from './styles'
import { breakpoints } from './nativeBaseSpec'
import {
  Button,
  useStyleSheet,
  Icon,
  Text,
  Popover,
} from '@ui-kitten/components'
import themedStyles from 'themeStyled'
import { DownloadCloudIcon, UploadCloudIcon, CloseCircleIcon } from './Icons'
import { IconGrayButton } from './styledComponents/IconButtons'
import PopoverContent from './PopOverContent'

const styleS = useStyleSheet(themedStyles)
const { width } = Dimensions.get('window')

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
  const [visible, setVisible] = useState<boolean>(false)
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
            await tryConvertToWebP(uploaded.uri),
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
  const renderToggleButton = (): React.ReactElement => (
    <Button
      status="secondary"
      appearance="ghost"
      onPress={() => setVisible(true)}
    >
      Tell me more
    </Button>
  )

  return (
    <VStack my="2" space={3}>
      <Center py={3}>
        <IconGrayButton
          text="Download all files"
          status="info"
          leftIcon={DownloadCloudIcon}
          onPress={() => generateZip(formMetadata, manifest)}
        />
      </Center>
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
              FORM PDF
            </Badge>
          </Center>
          {isInManifest(manifest, e => e.filename == 'form.pdf') ? (
            <IconGrayButton
              text="Remove pdf"
              status="danger"
              leftIcon={CloseCircleIcon}
              onPress={removePdf}
            />
          ) : (
            <IconGrayButton
              text="Upload an annotated pdf"
              status="info"
              leftIcon={UploadCloudIcon}
              onPress={pickPdf}
            />
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
                visible={visible}
                anchor={renderToggleButton}
                onBackdropPress={() => setVisible(false)}
              >
                <PopoverContent
                  content="TODO Describe how to annotate a pdf in Acrobat and how to fill
                  it out with Xs"
                  headerText="Annotating pdfs"
                  button1text="Close"
                  funcButton1={() => setVisible(false)}
                />
              </Popover>
            </HStack>
          </VStack>
        ) : (
          <Text
            style={[styleS.maxWidth300, styleS.width300, styleS.truncated]}
            numberOfLines={3}
          >
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
          <IconGrayButton
            text="Upload an image"
            status="info"
            leftIcon={UploadCloudIcon}
            onPress={pickImage}
          />
        </HStack>
        <View
          style={[
            styles.formEditorFileContainer,
            { padding: width > breakpoints.md ? 12 : 0 },
          ]}
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
        </View>
      </VStack>
    </VStack>
  )
}
