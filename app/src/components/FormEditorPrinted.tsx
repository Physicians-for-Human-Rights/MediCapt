import React, { useEffect, useState } from 'react'
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
  View,
} from 'native-base'
import { FormType } from 'utils/formTypes'
import yaml from 'js-yaml'
import { useWindowDimensions } from 'react-native'
import useDebounce from 'react-use/lib/useDebounce'
import { Platform } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import DashboardLayout from 'components/DashboardLayout'
import Form from 'components/Form'
import {
  RootStackScreenProps,
  RootStackParamList,
} from 'utils/formDesigner/navigation'
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
  console.log('W', width)
  let inner
  if (width) {
    console.log('pdf', width)
    inner = <DisplayPDF width={width} file={files['form.pdf']} />
  } else {
    inner = null
  }
  if ('form.pdf' in files) {
    return (
      <View
        onLayout={event => {
          console.log('L', event.nativeEvent.layout.width)
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
