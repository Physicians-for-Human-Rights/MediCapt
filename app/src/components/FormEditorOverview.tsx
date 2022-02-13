import React, { useEffect } from 'react'
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

export default function FormEditorOverview({
  files,
  form,
  setForm,
}: {
  files: Record<string, any>
  form: FormType
  setForm: React.Dispatch<React.SetStateAction<FormType>>
}) {
  return (
    <VStack>
      <Text>Overview</Text>
    </VStack>
  )
}
