import React, { useState } from 'react'
import { Select, ISelectProps, ISelectItemProps } from 'native-base'
import { t } from 'i18n-js'
import _ from 'lodash'
import { useUser, useUserLocations } from 'utils/store'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'
import { getLocationCached } from 'api/common'

export default function SelectLocation({
  placeholder,
  value,
  setValue,
  bg,
  any,
  itemProps,
  size = 'md',
  ...props
}: {
  placeholder: string
  value: string | undefined
  setValue: (locationID: string, locationUUID?: string) => any
  bg?: string
  any?: string
  size?: string
  itemProps?: ISelectItemProps
} & ISelectProps) {
  const locations = useUserLocations()
  if (locations) {
    return (
      <Select
        bg={bg}
        size={size}
        selectedValue={value}
        placeholder={placeholder}
        onValueChange={setValue}
        {...props}
      >
        {any ? (
          <Select.Item
            key={'__any__'}
            label={t(any)}
            value={''}
            {...itemProps}
          />
        ) : (
          <></>
        )}
        {_.map(locations, e => (
          <Select.Item
            size={size}
            key={_.isString(e) ? e : e.locationID}
            label={_.isString(e) ? e : e.shortName}
            value={_.isString(e) ? e : e.locationID}
            {...itemProps}
          />
        ))}
      </Select>
    )
  } else {
    return (
      // @ts-ignore TODO props is for lists not for inputs, should we choose the intersection?
      <DebouncedTextInput
        bg="white"
        size={size}
        color="black"
        placeholder={placeholder}
        debounceMs={1000}
        value={value}
        onChangeText={setValue}
        {...props}
      />
    )
  }
}
