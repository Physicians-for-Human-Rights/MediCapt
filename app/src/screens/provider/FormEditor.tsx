import React, { useState, useEffect } from 'react'
import { VStack } from 'native-base'
import useMap from 'react-use/lib/useMap'
import _ from 'lodash'

import Form from 'components/Form'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/formDesigner/navigation'
import { FormType } from 'utils/types/form'
import { getForm, getFormFiles } from '../../utils/localStore/store'
import { rawFiles } from '../../utils/localStore/mockServer'

const FormMemo = React.memo(Form)

function getImageIdsInForm(form: FormType) {
  // TODO -- place in a relevant utils file
  return Object.keys(rawFiles)
}

export default function FormEditor({
  route,
  navigation,
}: RootStackScreenProps<'FormEditor'>) {
  const [form, setForm] = useState(null as FormType | null)
  const [fileCache, { setAll: setFiles }] = useMap({} as Record<string, string>)

  useEffect(() => {
    const fetchForm = async () => {
      const form: FormType = await getForm('')
      const files = getImageIdsInForm(form!)
      setForm(form)
      setFiles(await getFormFiles(form.uuid, files))
    }

    fetchForm()
  }, [])

  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title="Fill out a record"
      signOut={route.params.signOut}
      user={route.params.user}
      displayHeader={false}
      fullWidth={true}
    >
      <VStack
        safeAreaBottom
        flex={1}
        borderRadius={{ md: '8' }}
        borderColor="coolGray.200"
        bg={'white'}
        px={{
          base: 0,
          md: 0,
        }}
      >
        {form && (
          <FormMemo
            files={fileCache}
            form={form}
            onCancel={() => navigation.goBack()}
          />
        )}
      </VStack>
    </DashboardLayout>
  )
}
