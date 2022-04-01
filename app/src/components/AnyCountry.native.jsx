import React from 'react'
import {
  HStack,
  VStack,
  Button,
  Badge,
  View,
  Icon,
  Select,
  CheckIcon,
  CloseIcon,
} from 'native-base'
import { t, locale } from 'i18n-js'
import _ from 'lodash'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  Feather,
  MaterialIcons,
} from '@expo/vector-icons'

export default function AnyCountry({ placeholder, value, setValue }) {
  console.error('AnyCountry is not available on mobile, only web')
  return <></>
}
