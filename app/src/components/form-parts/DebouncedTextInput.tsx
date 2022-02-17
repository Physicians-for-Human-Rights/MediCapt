import React, { useState, useEffect } from 'react'
import { t } from 'i18n-js'

import {
  Box,
  VStack,
  StatusBar,
  ScrollView,
  HStack,
  Pressable,
  // Icon,
  // Image,
  Text,
  Hidden,
  useColorMode,
  IconButton,
  Divider,
  Menu,
  Avatar,
  Button as BButton,
  Input,
  IInputProps,
  Center,
  useBreakpointValue,
  Modal,
  Checkbox,
} from 'native-base'
import useDebounce from 'react-use/lib/useDebounce'

import {
  TextInput,
  View,
  TouchableOpacity,
  Picker,
  Platform,
  ImageBackground,
} from 'react-native'
import { Icon, Button, ListItem, Image } from 'react-native-elements'
// @ts-ignore TODO TS doesn't understand .native.tsx and .web.tsx files
import DateTimePicker from 'components/DateTimePicker'
import PhotoSelector from 'components/PhotoSelector'
import _ from 'lodash'
import styles from 'styles'
import CardWrap from 'components/CardWrap'
import { FormDefinition, FormKVRawType } from 'utils/formTypes'
import { RecordPath } from 'utils/recordTypes'
import { resolveRef } from 'utils/forms'
import { FormFns } from 'utils/formTypesHelpers'
// @ts-ignore typescript doesn't like platform-specific modules
import Signature from 'components/Signature'
import BodyMarker from 'components/BodyMarker'
import { ListSelectMultiple } from 'components/form-parts/List'

// TODO Expand this input when multiline={true} as needed

export default function DebouncedTextInput(
  props: IInputProps & {
    debounceMs: number
    onChangeText: (value: string) => any
  }
) {
  const [rawContents, setRawContents] = React.useState(
    props.value === undefined || props.value === null ? '' : props.value
  )
  useDebounce(
    () => {
      if (
        rawContents === '' &&
        (props.value === undefined || props.value === null)
      )
        return
      //@ts-ignore This is correct, we will have a value
      props.onChangeText(rawContents)
    },
    props.debounceMs,
    [rawContents]
  )

  return <Input {...props} onChangeText={setRawContents} value={rawContents} />
}
