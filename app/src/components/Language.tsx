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

export default function Language({
  placeholder,
  value,
  setValue,
}: {
  placeholder: string
  value: string | undefined
  setValue: (val: string) => any
}) {
  const languages = [
    { alpha2: 'en', name: t('languages.en') },
    { alpha2: 'fr', name: t('languages.fr') },
  ]

  return (
    <Select
      size="md"
      selectedValue={value}
      placeholder={placeholder}
      onValueChange={setValue}
      m={3}
    >
      {languages.map(e => (
        <Select.Item key={e.alpha2} label={e.name} value={e.alpha2} />
      ))}
    </Select>
  )
}
