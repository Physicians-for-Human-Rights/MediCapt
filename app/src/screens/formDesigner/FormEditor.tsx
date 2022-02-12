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
import CodeEditor from '../../components/CodeEditor'

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
      <HStack px={{ base: 4, md: 4 }} mt="2" justifyContent="flex-start">
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

function InnerFormEditor({
  initialContents,
  navigation,
}: RootStackScreenProps<'FormEditor'>) {
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

  const [contents, setContents] = React.useState(initialContents)
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
          <FormMemo
            files={files}
            form={form}
            hasSideMenu={false}
            noRenderCache={true}
          />
        </Box>
      </HStack>
    </VStack>
  )
}

const FormMemo = React.memo(Form)

export default function FormEditor({
  route,
  navigation,
}: RootStackScreenProps<'FormEditor'>) {
  const [tabName, setTabName] = React.useState('Overview')
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
            {
              signature: {
                title: 'Authorizing medical exam',
                type: 'signature',
              },
            },
          ],
        },
      },
    ],
  } as FormType)

  return (
    <DashboardLayout
      title={'Form Editor'}
      displaySidebar={false}
      displayScreenTitle={false}
      backButton={true}
      navigation={navigation}
      middlebar={<Tabs tabName={tabName} setTabName={setTabName} />}
      fullWidth={true}
      signOut={route.params.signOut}
      user={route.params.user}
    >
      <VStack
        safeAreaBottom
        height="100%"
        borderRadius={{ md: '8' }}
        _light={{
          borderColor: 'coolGray.200',
        }}
        px={{
          base: 4,
          md: 32,
        }}
      >
        <InnerFormEditor
          initialContents={yaml.dump(form)}
          navigation={navigation}
        />
      </VStack>
    </DashboardLayout>
  )
}
