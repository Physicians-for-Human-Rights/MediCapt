import React, { useState, useEffect } from 'react'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import { default as ShareListComponent } from 'components/ShareList'
import { Share } from 'utils/types/share'
import { formatErrorMsg } from 'utils/errors'
import Loading from 'components/Loading'
import { RootStackScreenProps } from 'utils/associate/navigation'
import { getRecordShares } from 'api/associate'
import { useToast } from 'react-native-toast-notifications'
import i18n from 'i18n'

export default function FindShare({
  route,
  navigation,
}: RootStackScreenProps<'FindShare'>) {
  const [shares, setShares] = useState([] as Share[])
  const [nextKey, setNextKey] = useState(undefined as undefined | string)

  const [filterLocationID, setFilterLocationID] = useState('')
  const [filterText, setFilterText] = useState(undefined as undefined | string)
  const [filterSearchType, setFilterSearchType] = useState('')
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
      handleErrors(e)
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
      title={i18n.t('form.select-form')}
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
