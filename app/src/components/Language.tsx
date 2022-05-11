import React from 'react'
import { Select, ISelectProps, ISelectItemProps } from 'native-base'
import { t } from 'i18n-js'
import _ from 'lodash'

export const languages = ['en', 'fr']

export default function Language({
  placeholder,
  value,
  setValue,
  bg,
  any,
  itemProps,
  ...props
}: {
  placeholder: string
  value: string | undefined
  setValue: (val: string) => any
  bg?: string
  any?: string
  itemProps?: ISelectItemProps
} & ISelectProps) {
  return (
    <Select
      bg={bg}
      size="md"
      selectedValue={value}
      placeholder={placeholder}
      onValueChange={setValue}
      // TODO: Props causing crash in Android version
      // {...props}
    >
      {any ? (
        <Select.Item key={'__any__'} label={t(any)} value={''} {...itemProps} />
      ) : (
        <></>
      )}
      {languages.map(e => (
        <Select.Item
          key={e}
          label={t('languages.' + e)}
          value={e}
          {...itemProps}
        />
      ))}
    </Select>
  )
}
