import React, { useState, useEffect } from 'react'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import { default as RecordListComponent } from 'components/RecordList'
import { RecordMetadata } from 'utils/types/recordMetadata'
import { formatErrorMsg } from 'utils/errors'
import Loading from 'components/Loading'
import { RootStackScreenProps } from 'utils/provider/navigation'
import { getRecords } from '../../utils/localStore/store'
import { useUser } from 'utils/store'
import { useToast } from 'react-native-toast-notifications'
import i18n from 'i18n'

const filterAssociatedOut = (r: RecordMetadata) => !r.isAssociatedRecord

export default function RecordList({
  route,
  navigation,
}: RootStackScreenProps<'FindRecord'>) {
  console.log({ route, navigation })

  const [records, setRecords] = useState([] as RecordMetadata[])
  const [nextKey, setNextKey] = useState(undefined as undefined | string)

  const [filterLocationID, setFilterLocationID] = useState('')
  const [filterSearchType, setFilterSearchType] = useState('')
  const [filterText, setFilterText] = useState(undefined as undefined | string)

  const [waiting, setWaiting] = useState(null as null | string)
  const [user] = useUser()
  const toast = useToast()

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
      console.log('handle error')
      const res: string[] = formatErrorMsg(e)
      const msg: string = res.join(' ')
      toast.show(msg, {
        type: 'danger',
        placement: 'bottom',
        duration: 5000,
      })
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
      title={i18n.t('form.select-record')}
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
