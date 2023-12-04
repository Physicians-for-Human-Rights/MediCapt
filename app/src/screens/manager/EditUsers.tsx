import React, { useState, useRef } from 'react'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/manager/navigation'
import UserEditor from 'components/UserEditor'
import useMap from 'react-use/lib/useMap'
import _ from 'lodash'
import { UserType } from 'utils/types/user'
import { SafeAreaView, Dimensions } from 'react-native'
import { breakpoints } from '../../components/nativeBaseSpec'
import styles, { backgrounds } from '../../components/styles'
import { useStoreState } from 'utils/store'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md

export const defaultUser: Partial<UserType> = {
  'storage-version': '1.0.0',
  userUUID: '',
  userID: '',
  created_time: undefined,
  last_updated_time: undefined,
  username: undefined,
  email: undefined,
  birthdate: undefined,
  name: undefined,
  nickname: undefined,
  formal_name: undefined,
  gender: undefined,
  phone_number: undefined,
  official_id_type: undefined,
  official_id_code: undefined,
  official_id_expires: undefined,
  official_id_image: 'none',
  address: undefined,
  country: undefined,
  language: undefined,
  expiry_date: undefined,
  allowed_locations: undefined,
  created_by: undefined,
  userType: undefined,
  enabled: false,
  status: undefined,
}

export default function EditUser({
  route,
  navigation,
}: RootStackScreenProps<'EditUser'>) {
  const [user, setUser] = useState(
    ((route.params && route.params.user) || defaultUser) as Partial<UserType>
  )
  const state = useStoreState()
  const i18n = state?.i18n
  const [lastSubmitted, setLastSubmitted] = useState(
    null as Partial<UserType> | null
  )
  const [
    files,
    {
      set: setFile,
      setAll: setAllFiles,
      remove: removeFile,
      reset: resetFiles,
    },
  ] = useMap({} as Record<string, string>)
  const reloadPrevious = useRef(false)

  return (
    <DashboardLayout
      title={i18n.t('user.user-editor')}
      displaySidebar={false}
      displayScreenTitle={false}
      backButton={true}
      navigation={navigation}
      middlebar={<></>}
      mobileMiddlebar={<></>}
      fullWidth={false}
      route={route}
      reloadPrevious={reloadPrevious}
    >
      <SafeAreaView
        style={[
          styles.formEditorDesignerView,
          backgrounds.white,
          {
            borderRadius: isWider ? 8 : 0,
            paddingHorizontal: isWider ? 32 : 4,
          },
        ]}
      >
        <UserEditor
          files={files}
          user={user}
          setUser={setUser}
          changed={_.isEqual(lastSubmitted, location)}
          navigation={navigation}
          reloadPrevious={reloadPrevious}
        />
      </SafeAreaView>
    </DashboardLayout>
  )
}
