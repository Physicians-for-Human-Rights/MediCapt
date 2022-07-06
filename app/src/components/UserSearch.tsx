import React, { useEffect, useState } from 'react'
import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  Avatar,
  ScrollView,
  Pressable,
  useColorMode,
  Center,
  Input,
  Fab,
  IconButton,
  Divider,
  Button,
} from 'native-base'
import {
  AntDesign,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import { default as UserListComponent } from 'components/UserList'
import { useInfo, handleStandardErrors } from 'utils/errors'
import Loading from 'components/Loading'
import { UserType, userSchema } from 'utils/types/user'
import { findUsers } from 'api/common'

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
  const [error, warning, success] = useInfo()
  const [waiting, setWaiting] = useState(null as null | string)

  const [refresh, setRefresh] = useState(new Date())

  const doSearch = async () => {
    findUsers(
      () => setWaiting('Searching'),
      () => setWaiting(null),
      filterEnabledOrDisabled,
      filterLocation,
      filterSearchType,
      filterText,
      filterUserType,
      e => handleStandardErrors(error, warning, success, e),
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
