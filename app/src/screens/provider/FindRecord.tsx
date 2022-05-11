import React, { useState, useEffect } from 'react'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import { default as RecordListComponent } from 'components/RecordList'
import { RecordMetadata } from 'utils/types/recordMetadata'
import { useInfo, handleStandardErrors } from 'utils/errors'
import { findRecords } from 'api/provider'
import Loading from 'components/Loading'
import { RootStackScreenProps } from 'utils/provider/navigation'

export default function RecordList({
  route,
  navigation,
}: RootStackScreenProps<'FindRecord'>) {
  const [records, setRecords] = useState([] as RecordMetadata[])
  const [nextKey, setNextKey] = useState(undefined as any)
  const [filterCountry, setFilterCountry] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('')
  const [filterLocationID, setFilterLocationID] = useState('')
  const [filterEnabled, setFilterEnabled] = useState('')
  const [filterSearchType, setFilterSearchType] = useState('')
  const [filterText, setFilterText] = useState(undefined as undefined | string)
  const [error, warning, success] = useInfo()
  const [waiting, setWaiting] = useState(null as null | string)

  const doSearch = async () => {
    findRecords(
      () => setWaiting('Searching'),
      () => setWaiting(null),
      filterCountry,
      filterLanguage,
      filterLocationID,
      filterEnabled,
      filterSearchType,
      filterText,
      e => handleStandardErrors(error, warning, success, e),
      setRecords,
      setNextKey
    )
  }

  useEffect(() => {
    doSearch()
  }, [
    filterCountry,
    filterLanguage,
    filterLocationID,
    filterEnabled,
    filterSearchType,
    filterText,
  ])

  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title="Select a record"
    >
      <>
        <RecordListComponent
          records={records}
          hasMore={false}
          loadMore={() => null}
          filterCountry={filterCountry}
          setFilterCountry={setFilterCountry}
          filterLanguage={filterLanguage}
          setFilterLanguage={setFilterLanguage}
          filterLocationID={filterLocationID}
          setFilterLocationID={setFilterLocationID}
          filterEnabled={filterEnabled}
          setFilterEnabled={setFilterEnabled}
          filterSearchType={filterSearchType}
          setFilterSearchType={setFilterSearchType}
          filterText={filterText}
          setFilterText={setFilterText}
          doSearch={doSearch}
          selectItem={recordMetadata => {
            navigation.navigate('RecordEditor', {
              ...route.params,
              recordMetadata,
            })
          }}
        />
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
