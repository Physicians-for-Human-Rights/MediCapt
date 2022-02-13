import React, { useState, useEffect } from 'react'
import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  Center,
  Button,
  Pressable,
  Divider,
  Hidden,
  Square,
  Circle,
  Stack,
  Badge,
  Image,
  View,
  Input,
  InputGroup,
  InputLeftAddon,
  CheckIcon,
  CloseIcon,
  Popover,
  ScrollView,
  FlatList,
  IconButton,
} from 'native-base'
import { FormType } from 'utils/formTypes'
import yaml from 'js-yaml'
import { useWindowDimensions } from 'react-native'
import useDebounce from 'react-use/lib/useDebounce'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import DashboardLayout from 'components/DashboardLayout'
import Form from 'components/Form'
import {
  RootStackScreenProps,
  RootStackParamList,
} from 'utils/formDesigner/navigation'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import useMap from 'react-use/lib/useMap'
import * as FileSystem from 'expo-file-system'
import { isImage, readImage } from 'utils/forms'
import _ from 'lodash'

import { Button as NButton, Image as NImage, View as NView } from 'react-native'

export default function NecessaryItem({
  todoText,
  doneText,
  size = 4,
  mx = 4,
  isDone,
}: {
  todoText: string
  doneText: string
  size?: number | string
  mx?: number | string
  isDone: boolean
}) {
  if (isDone) {
    return (
      <HStack alignItems="center">
        <CheckIcon size={size} mx={mx} color="emerald.500" />
        <Text>{doneText}</Text>
      </HStack>
    )
  } else {
    return (
      <HStack alignItems="center">
        <CloseIcon size={size} mx={mx} color="error.500" />
        <Text color="error.500">{todoText}</Text>
      </HStack>
    )
  }
}
