import React, { useState, useEffect } from 'react'
import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  Avatar,
  ScrollView,
  Pressable,
  useColorMode,
  Center,
  Input,
  Fab,
  IconButton,
  Divider,
  Button,
} from 'native-base'
import {
  AntDesign,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import { default as LocationListComponent } from 'components/LocationList'
import { LocationType } from 'utils/types/location'
import { useInfo, handleStandardErrors } from 'utils/errors'
import Loading from 'components/Loading'
import { findLocations } from 'api/manager'

export default function FormList({ route, navigation }: any) {
  const [locations, setLocations] = useState([] as LocationType[])
  const [nextKey, setNextKey] = useState(undefined as any)
  const [filterCountry, setFilterCountry] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('')
  const [filterEntityType, setFilterEntityType] = useState('')
  const [filterText, setFilterText] = useState(undefined as undefined | string)
  const [error, warning, success] = useInfo()
  const [waiting, setWaiting] = useState(null as null | string)

  const doSearch = async () => {
    findLocations(
      () => setWaiting('Searching'),
      () => setWaiting(null),
      filterCountry,
      filterLanguage,
      filterEntityType,
      filterText,
      e => handleStandardErrors(error, warning, success, e),
      setLocations,
      setNextKey
    )
  }

  useEffect(() => {
    doSearch()
  }, [filterCountry, filterLanguage, filterEntityType, filterText])

  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title="Find a location"
    >
      <>
        <LocationListComponent
          hasMore={false}
          locations={locations}
          filterCountry={filterCountry}
          setFilterCountry={setFilterCountry}
          filterLanguage={filterLanguage}
          setFilterLanguage={setFilterLanguage}
          filterEntityType={filterEntityType}
          setFilterEntityType={setFilterEntityType}
          filterText={filterText}
          setFilterText={setFilterText}
          doSearch={doSearch}
          selectItem={location => {
            navigation.navigate('EditLocation', { ...route.params, location })
          }}
        />
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
