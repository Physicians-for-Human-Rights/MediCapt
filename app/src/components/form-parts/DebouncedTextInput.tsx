import React from 'react'
import { Input, IInputProps } from 'native-base'
import useDebounce from 'react-use/lib/useDebounce'

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
        (rawContents === '' &&
          (props.value === undefined || props.value === null)) ||
        rawContents === props.value
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
