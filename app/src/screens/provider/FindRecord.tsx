import React, { useState, useEffect } from 'react'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import { default as RecordListComponent } from 'components/RecordList'
import { RecordMetadata } from 'utils/types/recordMetadata'
import { useInfo, handleStandardErrors } from 'utils/errors'
import Loading from 'components/Loading'
import { RootStackScreenProps } from 'utils/provider/navigation'
import { getRecords } from '../../utils/localStore/store'
import { useUser } from 'utils/store'

const filterAssociatedOut = (r: RecordMetadata) => !r.isAssociatedRecord

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

  const [user] = useUser()

  const doSearch = async () => {
    setWaiting('Searching')
    try {
      const [records, nextKey] = await getRecords({
        locationId: filterLocationID,
        searchType: filterSearchType,
        createdByUUID:
          route.params && route.params.onlyUserRecords
            ? user.attributes.sub
            : undefined,
        text: filterText,
      })
      setRecords(records)
      setNextKey(nextKey)
    } catch (e) {
      handleStandardErrors(error, warning, success, e)
    }
    setWaiting(null)
  }

  const [refresh, setRefresh] = useState(new Date())

  useEffect(() => {
    doSearch()
  }, [filterLocationID, filterSearchType, filterText, refresh])

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
              setRefresh,
            })
          }}
          filter={filterAssociatedOut}
        />
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
