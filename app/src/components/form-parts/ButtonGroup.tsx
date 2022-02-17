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
  Button,
  Input,
  Center,
  useBreakpointValue,
  Modal,
  Checkbox,
} from 'native-base'

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

export default function ButtonGroup<T>({
  selected,
  options,
  onPress,
}: {
  selected: T | null
  options: Record<string, T>
  onPress: (arg: T) => any
}) {
  return (
    <Button.Group
      isAttached
      w="100%"
      size="md"
      colorScheme="blue"
      flex={1}
      justifyContent="center"
    >
      {_.map(options, (v: T, k: string) => {
        return (
          <Button
            key={k}
            flex={1}
            _text={{ bold: true }}
            maxW="30%"
            onPress={() => onPress(v)}
            variant={selected === v ? undefined : 'outline'}
          >
            {k}
          </Button>
        )
      })}
    </Button.Group>
  )
}
