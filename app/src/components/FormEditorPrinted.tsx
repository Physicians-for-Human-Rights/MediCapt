import React, { useState } from 'react'
import { Text, VStack, View } from 'native-base'
import { FormType } from 'utils/formTypes'
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
  let inner
  if (width) {
    inner = <DisplayPDF width={width} file={files['form.pdf']} />
  } else {
    inner = null
  }
  if ('form.pdf' in files) {
    return (
      <View
        onLayout={event => {
          setWidth(event.nativeEvent.layout.width)
        }}
      >
        {inner}
      </View>
    )
  } else {
    return (
      <VStack>
        <Text>Printed</Text>
      </VStack>
    )
  }
}
