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
import { findUsers } from 'api/manager'
import { useFocusEffect } from '@react-navigation/native'

export default function FormList({ route, navigation }: any) {
  const [users, setUsers] = useState([] as UserType[])
  const [nextKey, setNextKey] = useState(undefined as any)
  const [filterUserType, setFilterUserType] = useState('Manager')
  const [filterEnabledOrDisabled, setFilterEnabledOrDisabled] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterSearchType, setFilterSearchType] = useState('')
  const [filterText, setFilterText] = useState(undefined as undefined | string)
  const [error, warning, success] = useInfo()
  const [waiting, setWaiting] = useState(null as null | string)

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

  const [refresh, setRefresh] = useState(new Date())

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
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title="Find a user"
    >
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
          selectItem={user => {
            navigation.navigate('EditUser', {
              ...route.params,
              user,
              setRefresh,
            })
          }}
        />
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
