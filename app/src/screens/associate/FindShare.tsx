import React, { useState, useEffect } from 'react'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import { default as ShareListComponent } from 'components/ShareList'
import { Share } from 'utils/types/share'
import { useInfo, handleStandardErrors } from 'utils/errors'
import Loading from 'components/Loading'
import { RootStackScreenProps } from 'utils/associate/navigation'
import { getRecordShares } from 'api/associate'

export default function FindShare({
  route,
  navigation,
}: RootStackScreenProps<'FindShare'>) {
  const [shares, setShares] = useState([] as Share[])
  const [nextKey, setNextKey] = useState(undefined as undefined | string)

  const [filterLocationID, setFilterLocationID] = useState('')
  const [filterText, setFilterText] = useState(undefined as undefined | string)
  const [filterSearchType, setFilterSearchType] = useState('')

  const [error, warning, success] = useInfo()
  const [waiting, setWaiting] = useState(null as null | string)

  const doSearch = async () => {
    setWaiting('Searching')
    try {
      const [shares, nextKey] = await getRecordShares({
        locationId: filterLocationID,
        text: filterText,
        searchType: filterSearchType,
      })
      setShares(shares)
      setNextKey(nextKey)
    } catch (e) {
      handleStandardErrors(error, warning, success, e)
    }
    setWaiting(null)
  }

  useEffect(() => {
    doSearch()
  }, [filterLocationID, filterText, filterSearchType])

  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title="Select a form"
    >
      <>
        <ShareListComponent
          shares={shares}
          hasMore={false}
          loadMore={() => null}
          filterLocationID={filterLocationID}
          setFilterLocationID={setFilterLocationID}
          filterSearchType={filterSearchType}
          setFilterSearchType={setFilterSearchType}
          filterText={filterText}
          setFilterText={setFilterText}
          doSearch={doSearch}
          selectItem={x => {
            navigation.navigate('ShareViewer', {
              share: x,
            })
          }}
        />
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
