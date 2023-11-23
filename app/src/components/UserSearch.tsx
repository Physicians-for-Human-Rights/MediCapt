import React, { useEffect, useState } from 'react'

import _ from 'lodash'
import { default as UserListComponent } from 'components/UserList'
import { formatErrorMsg } from 'utils/errors'
import Loading from 'components/Loading'
import { UserType, userSchema } from 'utils/types/user'
import { findUsers } from 'api/common'
import { useToast } from 'react-native-toast-notifications'

export default function UserSearch({
  selectItem,
  defaultUserType = 'Manager',
  allowedUserTypes,
  onlyEnabledUsers = true,
  defaultLocationUUID = '',
}: {
  selectItem: (
    u: UserType,
    setRefresh: React.Dispatch<React.SetStateAction<Date>>
  ) => any
  defaultUserType?: string
  allowedUserTypes?: string[]
  onlyEnabledUsers?: boolean
  defaultLocationUUID?: string
}) {
  const [users, setUsers] = useState([] as UserType[])
  const [nextKey, setNextKey] = useState(undefined as any)
  const [filterUserType, setFilterUserType] = useState(defaultUserType)
  const [filterEnabledOrDisabled, setFilterEnabledOrDisabled] = useState('')
  const [filterLocation, setFilterLocation] = useState(defaultLocationUUID)
  const [filterSearchType, setFilterSearchType] = useState('')
  const [filterText, setFilterText] = useState(undefined as undefined | string)
  const [waiting, setWaiting] = useState(null as null | string)
  const [refresh, setRefresh] = useState(new Date())
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
    findUsers(
      () => setWaiting('Searching'),
      () => setWaiting(null),
      filterEnabledOrDisabled,
      filterLocation,
      filterSearchType,
      filterText,
      filterUserType,
      e => handleErrors(e),
      setUsers,
      setNextKey
    )
  }

  useEffect(() => {
    doSearch()
  }, [
    filterUserType,
    filterEnabledOrDisabled,
    filterLocation,
    filterText,
    refresh,
  ])

  return (
    <>
      <UserListComponent
        hasMore={false}
        users={users}
        filterUserType={filterUserType}
        setFilterUserType={setFilterUserType}
        filterEnabledOrDisabled={filterEnabledOrDisabled}
        setFilterEnabledOrDisabled={setFilterEnabledOrDisabled}
        filterLocation={filterLocation}
        setFilterLocation={setFilterLocation}
        filterSearchType={filterSearchType}
        setFilterSearchType={setFilterSearchType}
        filterText={filterText}
        setFilterText={setFilterText}
        doSearch={doSearch}
        defaultUserType={defaultUserType}
        allowedUserTypes={allowedUserTypes}
        selectItem={user => selectItem(user, setRefresh)}
      />
      <Loading loading={waiting} />
    </>
  )
}
