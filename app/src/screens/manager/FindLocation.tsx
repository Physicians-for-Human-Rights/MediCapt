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
import { API } from 'aws-amplify'
import { locationSchema } from 'utils/types/location'

export default function FormList({ route, navigation }: any) {
  const [locations, setLocations] = useState([] as LocationType[])
  const [nextKey, setNextKey] = useState(undefined as any)
  const [filterCountry, setFilterCountry] = useState(
    undefined as undefined | string
  )
  const [filterLanguage, setFilterLanguage] = useState(
    undefined as undefined | string
  )
  const [filterEntityType, setFilterEntityType] = useState(
    undefined as undefined | string
  )
  const [filterText, setFilterText] = useState(undefined as undefined | string)
  const [error, warning, success] = useInfo()
  const [waiting, setWaiting] = useState(null as null | string)

  const doSearch = async () => {
    console.log('DoSearch')
    try {
      setWaiting('Searching')
      let filters = []
      if (filterCountry) filters.push({ country: { eq: filterCountry } })
      if (filterLanguage) filters.push({ country: { eq: filterLanguage } })
      const data = await API.get('manager', '/manager/location', {
        queryStringParameters: {
          filter: JSON.stringify(filters),
        },
      })
      console.log('Got', data)
      // @ts-ignore
      setLocations(_.map(data.items, locationSchema.parse))
      setNextKey(data.nextKey)
    } catch (e) {
      handleStandardErrors(error, warning, success, e)
    } finally {
      setWaiting(null)
    }
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
      signOut={route.params.signOut}
      user={route.params.user}
    >
      <>
        <LocationListComponent
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
