import React, { useState, useEffect } from 'react'
import {
  Box,
  HStack,
  Icon,
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
  Modal,
} from 'native-base'
import { Text } from '@ui-kitten/components'
import { FormType } from 'utils/types/form'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { readImage, stripFileExtension } from 'utils/forms'
import _ from 'lodash'
import NecessaryItem from 'components/NecessaryItem'
import { t } from 'i18n-js'
import { getFormCached, getUserByUUIDCached } from 'api/common'
import { Feather, MaterialIcons } from '@expo/vector-icons'
// @ts-ignore TODO TS doesn't understand .native.js and .web.js files
import { tryConvertToWebP } from 'utils/imageConverter'
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
import FormSearch from 'components/FormSearch'

export default function FormEditorAssociations({
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
  const [forms, setForms] = useState({} as Record<string, FormMetadata>)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  const pickForm = () => {
    setIsSearchModalOpen(true)
  }

  useEffect(() => {
    async function formsFn() {
      const loadedForms = {} as Record<string, FormMetadata>
      await Promise.all(
        _.map(
          _.uniq(_.map(formMetadata.associatedForms, r => r.formUUID)),
          async formUUID => {
            const result = await getFormCached(formUUID, () => null)
            if (result) loadedForms[formUUID] = result.metadata
            return result
          }
        )
      )
      setForms(loadedForms)
    }
    formsFn()
  }, [formMetadata.associatedForms])

  const addForm = (associatedFormMetadata: FormMetadata) => {
    // Each form can be assoicated once
    if (
      !_.includes(
        _.map(formMetadata.associatedForms, x => x.formUUID),
        associatedFormMetadata.formUUID
      )
    )
      setFormMetadata({
        ...formMetadata,
        associatedForms: _.concat(formMetadata.associatedForms || [], [
          {
            formUUID: associatedFormMetadata.formUUID,
            formID: associatedFormMetadata.formID,
            title: 'Associated form',
          },
        ]),
      })
    setIsSearchModalOpen(false)
  }

  const removeForm = () => {}

  const pdfHasAnnotations = false

  const showForm = (f: FormMetadata | null | undefined) => {
    if (f) {
      return (
        <VStack my="2" space={0}>
          <Text>{f.title}</Text>
          <Text>{f.subtitle}</Text>
        </VStack>
      )
    } else {
    }
  }

  return (
    <>
      <VStack my="2" space={3}>
        <VStack my="2">
          <Center>
            <Button
              fontWeight="bold"
              color="coolGray.800"
              bg="info.500"
              fontSize="lg"
              onPress={pickForm}
              my={4}
              leftIcon={<Icon as={Feather} name="plus-square" size="sm" />}
            >
              Add associated form
            </Button>
          </Center>
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
              numColumns={1}
              data={formMetadata.associatedForms}
              renderItem={({ item }) => {
                return (
                  <Box bg={'muted.50'} rounded="8" my={2} p={2}>
                    <VStack m={1} borderRadius="md" key={item.title}>
                      {showForm(
                        _.find(forms || [], f => f.formUUID === item.formUUID)
                      )}
                      <HStack w="300px" maxWidth="300px" my={3}>
                        <DebouncedTextInput
                          w={{ md: '100%', lg: '100%', base: '100%' }}
                          bg="white"
                          size="lg"
                          color="black"
                          debounceMs={1000}
                          value={stripFileExtension(item.title)}
                          onChangeText={t =>
                            setFormMetadata({
                              ...formMetadata,
                              associatedForms: _.map(
                                formMetadata.associatedForms || [],
                                r => {
                                  if (r.formUUID === item.formUUID) {
                                    return { ...r, title: t }
                                  } else return r
                                }
                              ),
                            })
                          }
                        />
                        <IconButton
                          icon={
                            <Icon
                              as={MaterialCommunityIcons}
                              name="delete-forever"
                              color="blue"
                            />
                          }
                          borderRadius="full"
                          onPress={() =>
                            setFormMetadata({
                              ...formMetadata,
                              associatedForms: _.filter(
                                formMetadata.associatedForms || [],
                                r => r.formUUID !== item.formUUID
                              ),
                            })
                          }
                        />
                      </HStack>
                    </VStack>
                  </Box>
                )
              }}
              keyExtractor={(item, index) => 'key' + index}
            />
          </Box>
        </VStack>
      </VStack>
      <Modal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        size="full"
      >
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>
            {t('form-editor.associations.select-form')}
          </Modal.Header>
          <Modal.Body>
            <FormSearch selectItem={addForm} />
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setIsSearchModalOpen(false)}
              >
                Cancel
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  )
}
