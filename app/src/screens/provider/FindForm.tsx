import React, { useState, useEffect } from 'react'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import { default as FormListComponent } from 'components/FormList'
import { FormMetadata } from 'utils/types/formMetadata'
import { useInfo, handleStandardErrors } from 'utils/errors'
import { findForms } from 'api/provider'
import Loading from 'components/Loading'
import { RootStackScreenProps } from 'utils/provider/navigation'

export default function FindForm({
  route,
  navigation,
}: RootStackScreenProps<'FindForm'>) {
  const [forms, setForms] = useState([] as FormMetadata[])
  const [nextKey, setNextKey] = useState(undefined as undefined | string)
  const [filterCountry, setFilterCountry] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('')
  const [filterLocationID, setFilterLocationID] = useState('')
  const [filterEnabled, setFilterEnabled] = useState('')
  const [filterSearchType, setFilterSearchType] = useState('')
  const [filterText, setFilterText] = useState(undefined as undefined | string)
  const [error, warning, success] = useInfo()
  const [waiting, setWaiting] = useState(null as null | string)

  const doSearch = async () => {
    findForms(
      () => setWaiting('Searching'),
      () => setWaiting(null),
      filterCountry,
      filterLanguage,
      filterLocationID,
      filterSearchType,
      filterText,
      e => handleStandardErrors(error, warning, success, e),
      setForms,
      setNextKey
    )
  }

  useEffect(() => {
    doSearch()
  }, [
    filterCountry,
    filterLanguage,
    filterLocationID,
    filterSearchType,
    filterText,
  ])

  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title="Select a form"
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
            navigation.navigate('RecordEditor', {
              ...route.params,
              formMetadata,
            })
          }}
        />
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
