import React, { useState, useEffect } from 'react'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import { default as RecordListComponent } from 'components/RecordList'
import { RecordMetadata } from 'utils/types/recordMetadata'
import { useInfo, handleStandardErrors } from 'utils/errors'
import Loading from 'components/Loading'
import { RootStackScreenProps } from 'utils/provider/navigation'
import { getRecords } from '../../utils/localStore/store'

export default function RecordList({
  route,
  navigation,
}: RootStackScreenProps<'FindRecord'>) {
  const [records, setRecords] = useState([] as RecordMetadata[])
  const [nextKey, setNextKey] = useState(undefined as undefined | string)

  const [filterLocationID, setFilterLocationID] = useState('')
  const [filterSearchType, setFilterSearchType] = useState('')
  const [filterText, setFilterText] = useState(undefined as undefined | string)

  const [error, warning, success] = useInfo()
  const [waiting, setWaiting] = useState(null as null | string)

  const doSearch = async () => {
    setWaiting('Searching')
    try {
      const [records, nextKey] = await getRecords({
        locationId: filterLocationID,
        searchType: filterSearchType,
        text: filterText,
      })
      setRecords(records)
      setNextKey(nextKey)
    } catch (e) {
      handleStandardErrors(error, warning, success, e)
    }
    setWaiting(null)
  }

  useEffect(() => {
    doSearch()
  }, [filterLocationID, filterSearchType, filterText])

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
          filterLocationID={filterLocationID}
          setFilterLocationID={setFilterLocationID}
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
