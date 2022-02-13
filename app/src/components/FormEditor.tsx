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
// @ts-ignore typescript doesn't support .web.js and .native.js files
import CodeEditor from './CodeEditor'

const defaultForm: FormType = {
  name: 'New form',
  subtitle: 'A subtitle',
  description: 'Describe the form',
  'official-name': 'Official form name',
  'official-code': 'Official code',
  country: 'US',
  language: 'en',
  date: new Date(),
  tags: ['sexual-assault'],
  common: {
    gender: [
      { key: 'male', value: 'Male' },
      { key: 'female', value: 'Female' },
      { key: 'transgender', value: 'Transgender' },
    ],
  },
  sections: [
    {
      consent: {
        title: 'Consent',
        parts: [
          {
            'medical-exam': {
              title: 'Authorizing medical exam',
              description:
                'I AUTHORIZE the clinician to conduct a medical examination including a pelvic exam.',
              type: 'bool',
            },
          },
        ],
      },
    },
  ],
}

export default function FormEditor({
  files,
  form,
  setForm,
}: {
  files: Record<string, any>
  form: FormType
  setForm: React.Dispatch<React.SetStateAction<FormType>>
}) {
  const [contents, setContents] = React.useState(yaml.dump(form))
  useEffect(() => {
    try {
      setForm(yaml.load(contents) as FormType)
    } catch (e) {
      // TODO Error handling
      console.log(e)
    }
  }, [contents])

  const window = useWindowDimensions()
  const padding = Platform.OS === 'web' ? 0.03 : 0
  const ratio = Platform.OS === 'web' ? (window.width > 1000 ? 0.6 : 0.45) : 0

  const [rawContents, setRawContents] = React.useState(contents)
  useDebounce(
    () => {
      setContents(rawContents)
    },
    1000,
    [rawContents]
  )

  return (
    <VStack>
      {Platform.OS !== 'web' ? (
        <Center py={2}>
          <Text>Preview: Editing is web-only</Text>
        </Center>
      ) : null}
      <HStack pt="0" space={3} justifyContent="center">
        <CodeEditor
          ratio={ratio}
          contents={contents}
          window={window}
          setRawContents={setRawContents}
        />
        <Box
          h={Math.round(window.height * 0.85) + 'px'}
          w={Math.round(window.width * (1 - ratio - padding)) + 'px'}
        >
          <FormMemo files={files} form={form} noRenderCache={true} />
        </Box>
      </HStack>
    </VStack>
  )
}

const FormMemo = React.memo(Form)
