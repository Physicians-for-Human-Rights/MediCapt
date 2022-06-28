import React, { useEffect } from 'react'
import { Input, IInputProps } from 'native-base'
import useDebounce from 'react-use/lib/useDebounce'

// TODO Expand this input when multiline={true} as needed

export default function DebouncedTextInput(
  props: {
    debounceMs: number
    onChangeText: (value: string) => void
  } & Partial<IInputProps>
) {
  const [rawContents, setRawContents] = React.useState(
    props.value === undefined || props.value === null ? '' : props.value
  )
  useEffect(
    () =>
      setRawContents(
        props.value === undefined || props.value === null ? '' : props.value
      ),
    [props.value]
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

  return (
    <Input
      // TODO Why is this needed on tablets?
      minW="30%"
      {...props}
      onChangeText={setRawContents}
      value={rawContents}
    />
  )
}
