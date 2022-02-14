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
import Form from 'components/Form'

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

const FormMemo = React.memo(Form)

export default function FormEditor({
  route,
  navigation,
}: RootStackScreenProps<'FormEditor'>) {
  const [form, setForm] = React.useState(null)
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
          if (filename === 'form.yaml') setForm(yaml.load(data))
        }
      })
    }
    f()
  }, [])

  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title="Find a record"
      signOut={route.params.signOut}
      user={route.params.user}
    >
      <VStack
        safeAreaBottom
        height="95%"
        borderRadius={{ md: '8' }}
        borderColor="coolGray.200"
        bg={'white'}
        px={{
          base: 4,
          md: 32,
        }}
      >
        {form && <FormMemo files={files} form={form} />}
      </VStack>
    </DashboardLayout>
  )
}
