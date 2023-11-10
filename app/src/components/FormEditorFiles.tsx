import React, { useState } from 'react'
import { View, Dimensions, Image, FlatList } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { readImage, stripFileExtension } from 'utils/forms'
import _ from 'lodash'
import NecessaryItem from 'components/NecessaryItem'
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
import styles, { spacing, layout, borders } from './styles'
import { breakpoints, colors } from './nativeBaseSpec'
import {
  Button,
  useStyleSheet,
  Icon,
  Text,
  // Popover,
  Divider,
} from '@ui-kitten/components'
import themedStyles from '../themeStyled'
import { DownloadCloudIcon, UploadCloudIcon, CloseCircleIcon } from './Icons'
import { IconGrayButton } from './styledComponents/IconButtons'
// import PopoverContent from './PopOverContent'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md

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
  const styleS = useStyleSheet(themedStyles)
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
    <View style={[layout.vStackGap3, spacing.my2]}>
      <View style={[layout.center, spacing.py3]}>
        <IconGrayButton
          text="Download all files"
          status="info"
          leftIcon={DownloadCloudIcon}
          onPress={() => generateZip(formMetadata, manifest)}
        />
      </View>
      <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
        <View style={styles.formEditorFileView}>
          <View style={layout.center}>
            <Button
              // variant="solid"
              status="danger" //make this is no onhover effect
              size="tiny"
              // alignSelf="flex-start"
              // _text={{
              //   color: 'coolGray.50',
              //   fontWeight: 'bold',
              //   fontSize: 'xs',
              // }}
            >
              FORM PDF
            </Button>
          </View>
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
        </View>
        {isInManifest(manifest, e => e.filename == 'form.pdf') ? (
          <View
            style={[
              layout.vStackGap2,
              layout.justifyEnd,
              { paddingHorizontal: isWider ? 8 : 4 },
            ]}
          >
            <View
              style={[
                layout.hStackGap3,
                layout.alignCenter,
                layout.width100percent,
              ]}
            >
              <NecessaryItem
                isDone={pdfHasAnnotations}
                todoText="PDF has no annotations!"
                doneText="PDF has annotations"
                size="tiny"
                optional={false}
              />
              {/* <Popover
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
              </Popover> */}
            </View>
          </View>
        ) : (
          <Text
            style={[styleS.maxWidth300, styleS.width300, styleS.truncated]}
            numberOfLines={3}
          >
            TODO Instructions for what to upload and how to annoate
          </Text>
        )}
      </View>
      <Divider
        style={{ paddingVertical: 0.1, backgroundColor: colors.coolGray[200] }}
      />
      <View style={[layout.vStack, spacing.my2]}>
        <View style={layout.hStackGap3}>
          <View style={layout.center}>
            <Button
              status="danger"
              size="tiny" // make this no onhover effect
              // alignSelf="flex-start"
              // _text={{
              //   color: 'coolGray.50',
              //   fontWeight: 'bold',
              //   fontSize: 'xs',
              // }}
            >
              IMAGES
            </Button>
          </View>
          <IconGrayButton
            text="Upload an image"
            status="info"
            leftIcon={UploadCloudIcon}
            onPress={pickImage}
          />
        </View>
        <View
          style={[
            styles.formEditorFileContainer,
            { padding: width > breakpoints.md ? 12 : 0 },
          ]}
        >
          <FlatList
            style={[
              {
                marginBottom: isWider ? 20 : 0,
                marginTop: 2,
                display: isWider ? 'flex' : undefined,
              },
            ]}
            horizontal={false}
            numColumns={3}
            data={filterManifest(manifest, isImage).contents}
            renderItem={({ item }) => (
              <View
                style={[layout.vStack, spacing.m1, borders.roundedMd]}
                key={item.filename}
              >
                <Image
                  style={{
                    borderWidth: 1,
                    borderColor: colors.coolGray[200],
                    width: 200,
                    height: 200,
                    borderRadius: 16,
                  }}
                  // rounded="lg"
                  aria-label="Uploaded image"
                  // @ts-ignore TODO Fix this
                  source={item.data}
                  resizeMode="contain"
                />
                <View style={styles.formEditorFileButtonBox}>
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
                  <Button
                    accessoryLeft={
                      <Icon pack="material" name="delete-forever" />
                    }
                    // borderRadius="full"
                    onPress={() =>
                      setManifest(
                        filterManifest(
                          manifest,
                          e => item.filename !== e.filename
                        )
                      )
                    }
                  />
                </View>
              </View>
            )}
            keyExtractor={(item, index) => 'key' + index}
          />
        </View>
      </View>
    </View>
  )
}
