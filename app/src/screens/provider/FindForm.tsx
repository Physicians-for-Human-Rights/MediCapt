import React, { useState, useEffect, useMemo } from 'react'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import { default as FormListComponent } from 'components/FormList'
import { FormMetadata } from 'utils/types/formMetadata'
import { formatErrorMsg } from 'utils/errors'
import Loading from 'components/Loading'
import { RootStackScreenProps } from 'utils/provider/navigation'
import { getForms } from '../../utils/localStore/store'
import { useToast } from 'react-native-toast-notifications'
import i18n from '../../i18n'

export default function FindForm({
  route,
  navigation,
}: RootStackScreenProps<'FindForm'>) {
  const [forms, setForms] = useState([] as FormMetadata[])
  const [nextKey, setNextKey] = useState(undefined as undefined | string)

  const [filterCountry, setFilterCountry] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('')
  const [filterLocationID, setFilterLocationID] = useState('')
  const [filterText, setFilterText] = useState(undefined as undefined | string)
  const [filterSearchType, setFilterSearchType] = useState('')

  const [waiting, setWaiting] = useState(null as null | string)
  const toast = useToast()
  const doSearch = async () => {
    setWaiting('Searching')
    try {
      const [forms, nextKey] = await getForms({
        country: filterCountry,
        language: filterLanguage,
        locationId: filterLocationID,
        text: filterText,
        searchType: filterSearchType,
      })
      setForms(forms)
      setNextKey(nextKey)
    } catch (e) {
      // handleStandardErrors(e)
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

  useEffect(() => {
    if (Object.keys(toast).length !== 0) {
      doSearch()
    }
  }, [
    filterCountry,
    filterLanguage,
    filterLocationID,
    filterText,
    filterSearchType,
  ])

  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title={i18n.t('form.select-form')}
    >
      <>
        <FormListComponent
          forms={forms}
          hasMore={false}
          loadMore={() => null}
          filterCountry={filterCountry}
          setFilterCountry={setFilterCountry}
          filterLanguage={filterLanguage}
          setFilterLanguage={setFilterLanguage}
          filterLocationID={filterLocationID}
          setFilterLocationID={setFilterLocationID}
          filterSearchType={filterSearchType}
          setFilterSearchType={setFilterSearchType}
          filterText={filterText}
          setFilterText={setFilterText}
          doSearch={doSearch}
          selectItem={formMetadata => {
            navigation.pop()
            navigation.navigate('RecordEditor', {
              ...route.params,
              formMetadata,
              displayPageAfterOverview: true,
            })
          }}
        />
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
