import React, { useState, useEffect } from 'react'

import _ from 'lodash'
import { default as FormListComponent } from 'components/FormList'
import { FormMetadata } from 'utils/types/formMetadata'
import { formatErrorMsg } from 'utils/errors'
import { findForms } from 'api/formdesigner'
import Loading from 'components/Loading'
import { useToast } from 'react-native-toast-notifications'

import formsData from '../mockData/forms'

export default function FormSearch({
  selectItem,
}: {
  selectItem: (fm: FormMetadata) => any
}) {
  // const [forms, setForms] = useState<FormMetadata[]>([] as FormMetadata[])
  const [forms, setForms] = useState<FormMetadata[]>(formsData)
  const [nextKey, setNextKey] = useState(undefined as any)
  const [filterCountry, setFilterCountry] = useState<string>('')
  const [filterLanguage, setFilterLanguage] = useState<string>('')
  const [filterLocationID, setFilterLocationID] = useState<string>('')
  const [filterEnabled, setFilterEnabled] = useState('')
  const [filterSearchType, setFilterSearchType] = useState('')
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
    findForms(
      () => setWaiting('Searching'),
      () => setWaiting(null),
      filterCountry,
      filterLanguage,
      filterLocationID,
      filterEnabled,
      filterSearchType,
      filterText,
      e => handleErrors(e),
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
    filterEnabled,
    filterSearchType,
    filterText,
  ])

  return (
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
        filterEnabled={filterEnabled}
        setFilterEnabled={setFilterEnabled}
        filterSearchType={filterSearchType}
        setFilterSearchType={setFilterSearchType}
        filterText={filterText}
        setFilterText={setFilterText}
        doSearch={doSearch}
        selectItem={selectItem}
      />
      <Loading loading={waiting} />
    </>
  )
}
