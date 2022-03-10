import React from 'react'
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
import { default as FormListComponent } from 'components/FormList'
import { FormMetadata } from 'utils/types/form'

const forms: FormMetadata[] = [
  // @ts-ignore Missing fields, but it's temporray test data
  {
    title: 'Post-rape care form',
    subtitle: 'Keyna MOH 363',
    tags: 'sexual-assault',
    createdDate: new Date('2019-01-01T10:10:10.000Z'),
    enabled: true,
    formID: 'MF-DAK-D2A-LPF',
  },
  // @ts-ignore Missing fields, but it's temporray test data
  {
    title: 'Post-rape care form',
    subtitle: 'Keyna MOH 363',
    tags: 'sexual-assault',
    createdDate: new Date('2019-01-01T10:10:10.000Z'),
    enabled: false,
    formID: 'MF-DAK-D2A-LPF',
  },
  // @ts-ignore Missing fields, but it's temporray test data
  {
    title: 'Post-rape care form',
    subtitle: 'Keyna MOH 363',
    tags: 'sexual-assault',
    createdDate: new Date('2019-01-01T10:10:10.000Z'),
    enabled: true,
    formID: 'MF-DAK-D2A-LPF',
  },
  // @ts-ignore Missing fields, but it's temporray test data
  {
    title: 'Post-rape care form',
    subtitle: 'Keyna MOH 363',
    tags: 'sexual-assault',
    createdDate: new Date('2019-01-01T10:10:10.000Z'),
    enabled: true,
    formID: 'MF-DAK-D2A-LPF',
  },
  // @ts-ignore Missing fields, but it's temporray test data
  {
    title: 'Post-rape care form',
    subtitle: 'Keyna MOH 363',
    tags: 'sexual-assault',
    createdDate: new Date('2019-01-01T10:10:10.000Z'),
    enabled: true,
    formID: 'MF-DAK-D2A-LPF',
  },
]

export default function FormList({ route, navigation }: any) {
  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title="Select a form"
      signOut={route.params.signOut}
      user={route.params.user}
    >
      <FormListComponent forms={forms} />
    </DashboardLayout>
  )
}
