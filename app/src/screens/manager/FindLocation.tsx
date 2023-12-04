import React, { useState, useEffect } from 'react'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import { default as LocationListComponent } from 'components/LocationList'
import { LocationType } from 'utils/types/location'
import { formatErrorMsg } from 'utils/errors'
import Loading from 'components/Loading'
import { findLocations } from 'api/manager'
import { RootStackScreenProps } from 'utils/manager/navigation'
import { useToast } from 'react-native-toast-notifications'
import { useStoreState } from 'utils/store'

export default function FormList({
  route,
  navigation,
}: RootStackScreenProps<'FindLocation'>) {
  const state = useStoreState()
  const i18n = state?.i18n
  const [locations, setLocations] = useState([] as LocationType[])
  const [nextKey, setNextKey] = useState(undefined as any)
  const [filterCountry, setFilterCountry] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('')
  const [filterEntityType, setFilterEntityType] = useState('')
  const [filterText, setFilterText] = useState(undefined as undefined | string)
  const [waiting, setWaiting] = useState(null as null | string)
  const toast = useToast()

  const handleErrors = (e: any) => {
    const res: string[] = formatErrorMsg(e)
    const msg: string = res.join(' ')
    toast.show(msg, {
      type: 'danger',
      placement: 'bottom',
      duration: 5000,
    })
  }
  const doSearch = async () => {
    findLocations(
      () => setWaiting('Searching'),
      () => setWaiting(null),
      filterCountry,
      filterLanguage,
      filterEntityType,
      filterText,
      e => handleErrors(e),
      setLocations,
      setNextKey
    )
  }

  const [refresh, setRefresh] = useState(new Date())

  useEffect(() => {
    doSearch()
  }, [filterCountry, filterLanguage, filterEntityType, filterText, refresh])

  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title={i18n.t('location.find-location')}
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
            if (route.params && route.params.onSelect) {
              route.params.onSelect(location)
            } else
              navigation.navigate('EditLocation', {
                ...route.params,
                setRefresh,
                location,
              })
          }}
        />
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
