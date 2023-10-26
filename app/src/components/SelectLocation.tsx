import React, { useState } from 'react'
import {
  Select,
  SelectItem,
  SelectProps,
  SelectItemProps,
  IndexPath,
} from '@ui-kitten/components'
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
  itemProps?: SelectItemProps
} & SelectProps) {
  const locations = useUserLocations()
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>()
  const onSelect = (index: IndexPath) => {
    let i
    setSelectedIndex(index)
    if (any) {
      i = index.row + 1
      // plus 1
    } else {
      i = index.row
    }
    const selectedItem = locations[i]
    const id = _.isString(selectedItem) ? selectedItem : selectedItem.locationID
    const l = _.find(locations, l => (_.isString(l) ? l : l.locationID) === id)!
    setValue(id, _.isUndefined(l) || _.isString(l) ? l : l.locationUUID)
  }
  if (locations && !_.includes(locations, 'admin')) {
    return (
      <Select
        style={{ backgroundColor: bg }}
        size={size}
        selectedIndex={selectedIndex}
        // selectedValue={selected}
        placeholder={placeholder}
        onSelect={index => onSelect(index as IndexPath)}
        // onValueChange={id => {
        //   setSelected(id)
        //   const l = _.find(
        //     locations,
        //     l => (_.isString(l) ? l : l.locationID) === id
        //   )!
        //   setValue(id, _.isUndefined(l) || _.isString(l) ? l : l.locationUUID)
        // }}
        {...props}
      >
        {_.concat(
          any
            ? [
                <SelectItem
                  key={'__any__'}
                  title={t(any)}
                  // value={''}
                  {...itemProps}
                />,
              ]
            : [],
          _.map(locations, e => (
            <SelectItem
              key={_.isString(e) ? e : e.locationID}
              title={_.isString(e) ? e : e.shortName}
              // value={_.isString(e) ? e : e.locationID}
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
