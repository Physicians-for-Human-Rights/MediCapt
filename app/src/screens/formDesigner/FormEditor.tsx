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
import CodeMirror from '@uiw/react-codemirror'
import { StreamLanguage } from '@codemirror/stream-parser'
import { yaml as yamlLang } from '@codemirror/legacy-modes/mode/yaml'
import { FormType } from 'utils/formTypes'
import yaml from 'js-yaml'
import { useWindowDimensions } from 'react-native'
import { defaultHighlightStyle } from '@codemirror/highlight'
import { lineNumbers, highlightActiveLineGutter } from '@codemirror/gutter'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { commentKeymap } from '@codemirror/comment'
import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  dropCursor,
} from '@codemirror/view'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
import { defaultKeymap } from '@codemirror/commands'
import { indentOnInput } from '@codemirror/language'
import { history, historyKeymap } from '@codemirror/history'
import { lintGutter, lintKeymap } from '@codemirror/lint'
import { foldGutter, foldKeymap } from '@codemirror/fold'

import { MaterialIcons } from '@expo/vector-icons'
import DashboardLayout from 'components/DashboardLayout'
import Form from 'components/Form'
import {
  RootStackScreenProps,
  RootStackParamList,
} from 'utils/formDesigner/navigation'

function Tabs({
  tabName,
  setTabName,
}: {
  tabName: string
  setTabName: React.Dispatch<React.SetStateAction<string>>
}) {
  return (
    <Box
      width={{ md: '50%', base: '50%' }}
      _dark={{ bg: 'coolGray.900' }}
      _light={{ bg: { base: 'primary.900', md: 'white' } }}
    >
      <HStack px={{ base: 4, md: 4 }} mt="2" justifyContent="start">
        <Pressable
          px="5"
          onPress={() => {
            setTabName('Overview')
          }}
          maxW="40%"
        >
          <Text
            fontSize="md"
            fontWeight="medium"
            color={tabName == 'Overview' ? 'black' : 'coolGray.400'}
            selectable={false}
          >
            Overview
          </Text>
          <Box mt="2">
            <Divider
              py="0.5"
              _light={{
                bg: {
                  base: tabName == 'Overview' ? 'white' : 'primary.900',
                  md: tabName == 'Overview' ? 'primary.900' : 'white',
                },
              }}
            />
          </Box>
        </Pressable>
        <Pressable
          px="5"
          maxW="25%"
          onPress={() => {
            setTabName('Files')
          }}
        >
          <Text
            fontSize="md"
            fontWeight="medium"
            color={tabName == 'Files' ? 'black' : 'coolGray.400'}
            selectable={false}
          >
            Files
          </Text>
          <Box mt="2">
            <Divider
              py="0.5"
              _light={{
                bg: {
                  base: tabName == 'Files' ? 'white' : 'primary.900',
                  md: tabName == 'Files' ? 'primary.900' : 'white',
                },
              }}
            />
          </Box>
        </Pressable>
        <Pressable
          maxW="25%"
          onPress={() => {
            setTabName('Editor')
          }}
          px="5"
        >
          <Text
            fontSize="md"
            fontWeight="medium"
            color={tabName == 'Editor' ? 'black' : 'coolGray.400'}
            selectable={false}
          >
            Editor
          </Text>
          <Box mt="2">
            <Divider
              py="0.5"
              _light={{
                bg: {
                  base: tabName == 'Editor' ? 'white' : 'primary.900',
                  md: tabName == 'Editor' ? 'primary.900' : 'white',
                },
              }}
            />
          </Box>
        </Pressable>
      </HStack>
    </Box>
  )
}

export default function ({
  route,
  navigation,
}: RootStackScreenProps<'FormEditor'>) {
  const window = useWindowDimensions()
  const [tabName, setTabName] = React.useState('Overview')
  const [files, setFiles] = React.useState([] as Record<string, any>)
  const [form, setForm] = React.useState({
    name: 'New form',
    subtitle: 'A subtitle',
    description: 'Describe the form',
    'official-name': 'Official form name',
    'official-code': 'Official code',
    country: 'US',
    language: 'en',
    date: new Date(),
    tags: 'sexual-assault',
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
  } as FormType)

  const [contents, setContents] = React.useState(yaml.dump(form))
  useEffect(() => {
    try {
      setForm(yaml.load(contents) as FormType)
    } catch (e) {
      console.log(e)
    }
  }, [contents])

  return (
    <DashboardLayout
      title={'Form Editor'}
      displaySidebar={false}
      displayScreenTitle={false}
      backButton={true}
      navigation={navigation}
      middlebar={<Tabs tabName={tabName} setTabName={setTabName} />}
    >
      <VStack
        safeAreaBottom
        height="100%"
        borderRadius={{ md: '8' }}
        _light={{
          borderColor: 'coolGray.200',
          bg: { base: 'white' },
        }}
        px={{
          base: 4,
          md: 32,
        }}
      >
        <HStack pt="5" space={3} justifyContent="center">
          <CodeMirror
            value={contents}
            height={Math.round(window.height * 0.8) + 'px'}
            width={Math.round(window.width * 0.4) + 'px'}
            extensions={[
              StreamLanguage.define(yamlLang),
              defaultHighlightStyle.fallback,
              lineNumbers(),
              highlightActiveLineGutter(),
              indentOnInput(),
              foldGutter(),
              lintGutter(),
              keymap.of([
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...searchKeymap,
                ...historyKeymap,
                ...commentKeymap,
                ...completionKeymap,
                ...lintKeymap,
                ...foldKeymap,
              ]),
            ]}
            onChange={value => setContents(value)}
          />
          <Box
            h={Math.round(window.height * 0.8) + 'px'}
            w={Math.round(window.width * 0.4) + 'px'}
          >
            <Form
              files={files}
              form={form}
              hasSideMenu={false}
              hasBottom={false}
            />
          </Box>
        </HStack>
      </VStack>
    </DashboardLayout>
  )
}
