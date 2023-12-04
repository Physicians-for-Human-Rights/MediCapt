import React, { useState, useRef } from 'react'

import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/manager/navigation'
import LocationEditor from 'components/LocationEditor'
import useMap from 'react-use/lib/useMap'
import _ from 'lodash'
import { LocationType } from 'utils/types/location'
import { View, Dimensions, SafeAreaView } from 'react-native'
import styles, { backgrounds, layout } from '../../components/styles'
import { breakpoints } from '../../components/nativeBaseSpec'
import { useStoreState } from 'utils/store'
const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md

export const defaultLocation: Partial<LocationType> = {
  'storage-version': '1.0.0',
  locationUUID: '',
  locationID: '',
  country: undefined,
  language: undefined,
  legalName: undefined,
  shortName: undefined,
  entityType: undefined,
  mailingAddress: undefined,
  coordinates: undefined,
  phoneNumber: undefined,
  email: undefined,
  createdDate: undefined,
  createdByUUID: undefined,
  lastChangedByUUID: undefined,
  lastChangedDate: undefined,
  enabled: false,
  tags: new Set(),
  version: undefined,
}

export default function EditLocation({
  route,
  navigation,
}: RootStackScreenProps<'EditLocation'>) {
  const [location, setLocation] = useState(
    ((route.params && route.params.location) ||
      defaultLocation) as Partial<LocationType>
  )
  const state = useStoreState()
  const i18n = state?.i18n
  const [lastSubmitted, setLastSubmitted] = useState(
    null as Partial<LocationType> | null
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
      title={i18n.t('location.editor')}
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
        <LocationEditor
          files={files}
          location={location}
          setLocation={setLocation}
          changed={_.isEqual(lastSubmitted, location)}
          reloadPrevious={reloadPrevious}
        />
      </SafeAreaView>
    </DashboardLayout>
  )
}
