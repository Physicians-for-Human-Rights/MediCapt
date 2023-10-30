import React, { useState, useEffect } from 'react'
import { View, Dimensions, FlatList } from 'react-native'
import {
  Text,
  Button,
  useStyleSheet,
  Icon,
  Modal,
  Card,
} from '@ui-kitten/components'
import { stripFileExtension } from 'utils/forms'
import _ from 'lodash'
import { t } from 'i18n-js'
import { getFormCached } from 'api/common'
// @ts-ignore TODO TS doesn't understand .native.js and .web.js files
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'

import FormSearch from 'components/FormSearch'
import styles, { borders, spacing } from './styles'
import { breakpoints } from './nativeBaseSpec'
import themedStyles from '../themeStyled'
import { PlusIcon } from './Icons'
import { layout } from './styles'
import ModalHeader from '../components/styledComponents/ModalHeader'

const { width } = Dimensions.get('window')

const isWider = width > breakpoints.md

const Footer = (props: any) => {
  const styleS = useStyleSheet(themedStyles)
  const { setIsSearchModalOpen } = props
  return (
    <Button
      appearance="ghost"
      // colorScheme="blueGray"
      status="info"
      onPress={() => setIsSearchModalOpen(false)}
    >
      Cancel
    </Button>
  )
}

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
        <View style={[layout.vStack, spacing.my2]}>
          <Text>{f.title}</Text>
          <Text>{f.subtitle}</Text>
        </View>
      )
    } else {
    }
  }
  const localStyle: any = {
    marginBottom: isWider ? 20 : 0,
    display: isWider ? 'flex' : undefined,
  }
  return (
    <>
      <View style={[layout.vStackGap3, spacing.my2]}>
        <View style={[layout.vStack, spacing.my2]}>
          <View style={layout.center}>
            <Button
              style={[
                styleS.fontBold,
                styleS.colorCoolGray800,
                styleS.fontSizeLg,
                styleS.my4,
              ]}
              status="info"
              onPress={pickForm}
              accessoryLeft={PlusIcon}
            >
              Add associated form
            </Button>
          </View>
          <View
            style={[
              styles.formEditorContainer,
              { padding: width > breakpoints.md ? 12 : 0 },
            ]}
          >
            <FlatList
              style={[localStyle, spacing.mt2]}
              horizontal={false}
              numColumns={1}
              data={formMetadata.associatedForms}
              renderItem={({ item }) => {
                return (
                  <View style={[styles.formEditorListBox]}>
                    <View
                      style={[layout.vStack, spacing.m1, borders.roundedMd]}
                      key={item.title}
                    >
                      {showForm(
                        _.find(forms || [], f => f.formUUID === item.formUUID)
                      )}
                      <View style={[styles.formEditorAssociations]}>
                        <DebouncedTextInput
                          w={{ md: '100%', lg: '100%', base: '100%' }}
                          bg="white"
                          size="lg"
                          color="black"
                          debounceMs={1000}
                          value={stripFileExtension(item?.title || '')}
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
                        <Button
                          accessoryLeft={
                            <Icon
                              pack="material"
                              name="delete-forever"
                              status="info"
                            />
                          }
                          // borderRadius="full"
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
                      </View>
                    </View>
                  </View>
                )
              }}
              keyExtractor={(item, index) => 'key' + index}
            />
          </View>
        </View>
      </View>
      <Modal
        visible={isSearchModalOpen}
        onBackdropPress={() => setIsSearchModalOpen(false)}
        backdropStyle={styleS.backdrop}
        // size="full"
      >
        <Card
          header={props => (
            <ModalHeader
              {...props}
              text={t('form-editor.associations.select-form')}
            />
          )}
          footer={props => (
            <Footer {...props} setIsSearchModalOpen={setIsSearchModalOpen} />
          )}
        >
          <FormSearch selectItem={addForm} />
        </Card>
      </Modal>
    </>
  )
}
