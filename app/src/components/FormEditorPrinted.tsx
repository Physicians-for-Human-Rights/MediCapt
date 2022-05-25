import React, { useState } from 'react'
import { Text, VStack, View } from 'native-base'
import { FormType } from 'utils/types/form'
// @ts-ignore typescript doesn't do native/web modules
import DisplayPDF from './DisplayPDF'
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
import {
  isImage,
  isInManifest,
  filterManifest,
  mapManifest,
  addFileToManifest,
  makeManifestEntry,
  changeFilenameInManifest,
  lookupManifestByNameAndType,
} from 'utils/manifests'

export default function FormEditorPrinted({
  formMetadata,
  manifest,
}: {
  formMetadata: Partial<FormMetadata>
  manifest: FormManifestWithData
}) {
  const [width, setWidth] = useState(null as number | null)
  if (isInManifest(manifest, e => e.filename == 'form.pdf')) {
    return (
      <View
        onLayout={event => {
          setWidth(event.nativeEvent.layout.width)
        }}
      >
        {width && (
          <DisplayPDF
            width={width}
            file={
              lookupManifestByNameAndType(
                manifest,
                'form.pdf',
                'application/pdf'
              )!.data
            }
          />
        )}
      </View>
    )
  }
  return (
    <VStack>
      <Text>PDF is not uploaded</Text>
    </VStack>
  )
}
