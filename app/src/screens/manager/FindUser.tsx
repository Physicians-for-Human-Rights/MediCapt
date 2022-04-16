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
import { API } from 'aws-amplify'
import { QueryFilterForType } from 'utils/types/url'

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
    try {
      setWaiting('Searching')
      let filters: QueryFilterForType<UserType & Record<string, string>> = []
      if (filterEnabledOrDisabled)
        filters.push({ status: { eq: filterEnabledOrDisabled } })
      if (filterLocation)
        filters.push({ allowed_locations: { eq: filterLocation } })
      if (filterSearchType && filterText)
        filters.push({ [filterSearchType]: { contains: filterText } })
      const data = await API.get('manager', '/manager/user', {
        queryStringParameters: {
          userType: JSON.stringify(filterUserType),
          filter: JSON.stringify(filters),
        },
      })
      // @ts-ignore
      setUsers(_.map(data.items, userSchema.partial().parse))
      setNextKey(data.nextKey)
    } catch (e) {
      handleStandardErrors(error, warning, success, e)
    } finally {
      setWaiting(null)
    }
  }

  useEffect(() => {
    doSearch()
  }, [
    filterUserType,
    filterEnabledOrDisabled,
    filterLocation,
    filterSearchType,
    filterText,
  ])

  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title="Find a user"
      signOut={route.params.signOut}
      user={route.params.user}
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
              userToEdit: user,
            })
          }}
        />
        <Loading loading={waiting} />
      </>
    </DashboardLayout>
  )
}
