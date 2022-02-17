import React, { useEffect } from 'react'
import {
  Box,
  HStack,
  Text,
  VStack,
  Pressable,
  Divider,
  Hidden,
  Select,
  CheckIcon,
} from 'native-base'
import { FormType } from 'utils/formTypes'
import yaml from 'js-yaml'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/formDesigner/navigation'
import FormEditorComponent from 'components/FormEditor'
import FormEditorFiles from 'components/FormEditorFiles'
import FormEditorPrinted from 'components/FormEditorPrinted'
import FormEditorOverview from 'components/FormEditorOverview'
import useMap from 'react-use/lib/useMap'
import _ from 'lodash'
import { readFile } from 'utils/forms'

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
      _light={{ bg: { base: 'primary.900', md: 'white' } }}
    >
      <Hidden from="lg">
        <Box pl="10" w="2/4" maxW="300">
          <Select
            selectedValue={tabName}
            minWidth="100"
            accessibilityLabel="Select page"
            placeholder="Select page"
            bg="white"
            _selectedItem={{
              bg: 'teal.600',
              endIcon: <CheckIcon size="5" />,
            }}
            mt={1}
            onValueChange={itemValue => setTabName(itemValue)}
          >
            <Select.Item label="Overview" value="Overview" />
            <Select.Item label="Files" value="Files" />
            <Select.Item label="Editor" value="Editor" />
            <Select.Item label="Print preview" value="Print preview" />
          </Select>
        </Box>
      </Hidden>
      <Hidden till="lg">
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
              color={tabName === 'Overview' ? 'black' : 'coolGray.400'}
              selectable={false}
            >
              Overview
            </Text>
            <Box mt="2">
              <Divider
                py="0.5"
                _light={{
                  bg: {
                    base: tabName === 'Overview' ? 'white' : 'primary.900',
                    md: tabName === 'Overview' ? 'primary.900' : 'white',
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
              color={tabName === 'Files' ? 'black' : 'coolGray.400'}
              selectable={false}
            >
              Files
            </Text>
            <Box mt="2">
              <Divider
                py="0.5"
                _light={{
                  bg: {
                    base: tabName === 'Files' ? 'white' : 'primary.900',
                    md: tabName === 'Files' ? 'primary.900' : 'white',
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
              color={tabName === 'Editor' ? 'black' : 'coolGray.400'}
              selectable={false}
            >
              Editor
            </Text>
            <Box mt="2">
              <Divider
                py="0.5"
                _light={{
                  bg: {
                    base: tabName === 'Editor' ? 'white' : 'primary.900',
                    md: tabName === 'Editor' ? 'primary.900' : 'white',
                  },
                }}
              />
            </Box>
          </Pressable>
          <Pressable
            maxW="25%"
            onPress={() => {
              setTabName('Printed')
            }}
            px="5"
          >
            <Text
              fontSize="md"
              fontWeight="medium"
              color={tabName === 'Printed' ? 'black' : 'coolGray.400'}
              selectable={false}
            >
              Printed
            </Text>
            <Box mt="2">
              <Divider
                py="0.5"
                _light={{
                  bg: {
                    base: tabName === 'Printed' ? 'white' : 'primary.900',
                    md: tabName === 'Printed' ? 'primary.900' : 'white',
                  },
                }}
              />
            </Box>
          </Pressable>
        </HStack>
      </Hidden>
    </Box>
  )
}

const defaultForm: FormType = {
  title: 'New form',
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
}

const rawFiles: Record<string, string> = {
  'form.yaml':
    require('../../../assets/forms/ke-moh-363-2019/form.yaml') as string,
  'form.pdf':
    require('../../../assets/forms/ke-moh-363-2019/form.pdf') as string,
  'anterior.png':
    require('../../../assets/forms/ke-moh-363-2019/anterior.png') as string,
  'bottom.png':
    require('../../../assets/forms/ke-moh-363-2019/bottom.png') as string,
  'female-1.png':
    require('../../../assets/forms/ke-moh-363-2019/female-1.png') as string,
  'female-2.png':
    require('../../../assets/forms/ke-moh-363-2019/female-2.png') as string,
  'female-3.png':
    require('../../../assets/forms/ke-moh-363-2019/female-3.png') as string,
  'male-1.png':
    require('../../../assets/forms/ke-moh-363-2019/male-1.png') as string,
  'male-2.png':
    require('../../../assets/forms/ke-moh-363-2019/male-2.png') as string,
  'posterior.png':
    require('../../../assets/forms/ke-moh-363-2019/posterior.png') as string,
  'male-3.png':
    require('../../../assets/forms/ke-moh-363-2019/male-3.png') as string,
  'top.png': require('../../../assets/forms/ke-moh-363-2019/top.png') as string,
}

export default function FormEditor({
  route,
  navigation,
}: RootStackScreenProps<'FormEditor'>) {
  const [tabName, setTabName] = React.useState('Overview')
  const [form, setForm] = React.useState(defaultForm)
  const [
    files,
    {
      set: setFile,
      setAll: setAllFiles,
      remove: removeFile,
      reset: resetFiles,
    },
  ] = useMap(rawFiles)
  const [
    fileCache,
    {
      set: setFileCache,
      setAll: setAllFileCache,
      remove: removeFileCache,
      reset: resetFileCache,
    },
  ] = useMap({} as Record<string, string>)

  useEffect(() => {
    const f = async () => {
      _.map(files, async (uri, filename) => {
        const data = await readFile(filename, uri)
        if (data) {
          setFileCache(filename, data)
          if (filename === 'form.yaml') setForm(yaml.load(data) as FormType)
        }
      })
    }
    f()
  }, [])

  let page = null
  switch (tabName) {
    case 'Overview':
      page = <FormEditorOverview files={files} form={form} setForm={setForm} />
      break
    case 'Editor':
      page = (
        <FormEditorComponent
          files={fileCache}
          form={form}
          setForm={setForm}
          onCancel={() => null}
        />
      )
      break
    case 'Files':
      page = (
        <FormEditorFiles
          fileCache={fileCache}
          setFileCache={setFileCache}
          files={files}
          setFile={setFile}
          removeFile={removeFile}
          form={form}
          setForm={setForm}
        />
      )
      break
    case 'Printed':
      page = (
        <FormEditorPrinted files={fileCache} form={form} setForm={setForm} />
      )
      break
  }
  return (
    <DashboardLayout
      title={'Form Editor'}
      displaySidebar={false}
      displayScreenTitle={false}
      backButton={true}
      navigation={navigation}
      middlebar={<Tabs tabName={tabName} setTabName={setTabName} />}
      mobileMiddlebar={<Tabs tabName={tabName} setTabName={setTabName} />}
      fullWidth={tabName === 'Editor'}
      signOut={route.params.signOut}
      user={route.params.user}
    >
      <VStack
        safeAreaBottom
        height="95%"
        borderRadius={{ md: '8' }}
        borderColor="coolGray.200"
        bg={tabName !== 'Editor' ? 'white' : null}
        px={{
          base: 4,
          md: 32,
        }}
      >
        {page}
      </VStack>
    </DashboardLayout>
  )
}
