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

export default function AnyCountry({
  placeholder,
  value,
  setValue,
}: {
  placeholder: string
  value: string | undefined
  setValue: (val: string) => any
}) {
  const language = _.split(locale, '-')[0]
  const countries = require('../../../assets/countries/' +
    language +
    '/world.json')

  return (
    <Select
      size="md"
      selectedValue={value}
      placeholder={placeholder}
      onValueChange={setValue}
      m={3}
    >
      {countries.map(e => (
        <Select.Item size="md" key={e.alpha2} label={e.name} value={e.alpha2} />
      ))}
    </Select>
  )
}
