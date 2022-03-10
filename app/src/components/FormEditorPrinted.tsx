import React, { useState } from 'react'
import { Text, VStack, View } from 'native-base'
import { FormType } from 'utils/types/form'
// @ts-ignore typescript doesn't do native/web modules
import DisplayPDF from './DisplayPDF'

export default function FormEditorPrinted({
  files,
  form,
  setForm,
}: {
  files: Record<string, any>
  form: FormType
  setForm: React.Dispatch<React.SetStateAction<FormType>>
}) {
  const [width, setWidth] = useState(null as number | null)
  if ('form.pdf' in files) {
    return (
      <View
        onLayout={event => {
          setWidth(event.nativeEvent.layout.width)
        }}
      >
        {width && <DisplayPDF width={width} file={files['form.pdf']} />}
      </View>
    )
  }
  return (
    <VStack>
      <Text>Printed</Text>
    </VStack>
  )
}
