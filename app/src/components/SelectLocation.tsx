import React, { useState } from 'react'
import { Select, ISelectProps, ISelectItemProps } from 'native-base'
import { t } from 'i18n-js'
import _ from 'lodash'
import { useUserLocations } from 'utils/store'
import DebouncedTextInput from 'components/form-parts/DebouncedTextInput'

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
  setValue: (locationID: string, locationUUID: string) => any
  bg?: string
  any?: string
  size?: string
  itemProps?: ISelectItemProps
} & ISelectProps) {
  const locations = useUserLocations()
  const [selected, setSelected] = useState(value)
  if (locations && !_.includes(locations, 'admin')) {
    return (
      <Select
        bg={bg}
        size={size}
        selectedValue={selected}
        placeholder={placeholder}
        onValueChange={id => {
          setSelected(id)
          const l = _.find(
            locations,
            l => (_.isString(l) ? l : l.locationID) === id
          )!
          setValue(id, _.isString(l) ? l : l.locationUUID)
        }}
        {...props}
      >
        {_.concat(
          any
            ? [
                <Select.Item
                  key={'__any__'}
                  label={t(any)}
                  value={''}
                  {...itemProps}
                />,
              ]
            : [],
          _.map(locations, e => (
            <Select.Item
              size={size}
              key={_.isString(e) ? e : e.locationID}
              label={_.isString(e) ? e : e.shortName}
              value={_.isString(e) ? e : e.locationID}
              {...itemProps}
            />
          ))
        )}
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
