import React, { useState } from 'react'
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
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/manager/navigation'
import LocationEditor from 'components/LocationEditor'
import useMap from 'react-use/lib/useMap'
import _ from 'lodash'
import { LocationType } from 'utils/types/location'

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
    (route.params.location || defaultLocation) as Partial<LocationType>
  )
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

  return (
    <DashboardLayout
      title={'Location Editor'}
      displaySidebar={false}
      displayScreenTitle={false}
      backButton={true}
      navigation={navigation}
      middlebar={<></>}
      mobileMiddlebar={<></>}
      fullWidth={false}
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
        <LocationEditor
          files={files}
          location={location}
          setLocation={setLocation}
          changed={_.isEqual(lastSubmitted, location)}
        />
      </VStack>
    </DashboardLayout>
  )
}
