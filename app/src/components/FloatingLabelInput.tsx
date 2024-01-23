import React, { Component, useCallback, useEffect } from 'react'
import useDebounce from 'react-use/lib/useDebounce'
import { Animated, StyleSheet, View } from 'react-native'
import { Input } from '@ui-kitten/components'
import _ from 'lodash'

export class RawFloatingLabelInput extends Component<any, any> {
  private _animatedIsFocused: any
  constructor(props: any) {
    super(props)
    this.state = {
      isFocused: false,
    }

    this._animatedIsFocused = new Animated.Value(
      this.props.defaultValue === '' ? 0 : 1
    )
  }

  handleFocus = () => {
    this.setState({ isFocused: true })
    this.props &&
      'toggleFocusHandler' in this.props &&
      this.props.toggleFocusHandler(true)
  }
  handleBlur = () => {
    this.setState({ isFocused: false })
    this.props &&
      'toggleFocusHandler' in this.props &&
      this.props.toggleFocusHandler(false)
  }
  handleChange = (str: string) => {
    //if not readonly
    console.log('this.props.readonly', this.props.readonly)
    if (!this.props.readonly) {
      this.props.onChangeText(str)
    }
  }

  componentDidUpdate() {
    Animated.timing(this._animatedIsFocused, {
      duration: 200,
      useNativeDriver: false,
      toValue: this.state.isFocused || this.props.defaultValue !== '' ? 1 : 0,
    }).start()
  }

  render() {
    const { label, ...props } = this.props

    const localStyles = StyleSheet.create({
      container: {
        width: this.props.containerWidth,
        marginHorizontal: 12,
        marginTop: this.props.mt,
        marginBottom: 12,
      },
    })
    return (
      <View style={localStyles.container}>
        <Input
          {...props}
          label={label}
          style={{ padding: 12, marginTop: 0 }}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onChangeText={this.handleChange}
          // disabled={props.isReadOnly}
        />
      </View>
    )
  }
}

export default function FloatingLabelInput({
  label,
  defaultValue,
  value,
  setValue,
  w,
  containerW,
  isReadOnly,
  placeholder,
  debounceMs = 300,
  mt = 5,
}: {
  label: string
  defaultValue?: string
  value?: string
  setValue?: (s: string) => any
  w?: string | number
  containerW?: string | number
  isReadOnly?: boolean
  placeholder?: string
  debounceMs?: number
  mt?: number
}) {
  const [rawValue, setRawValue] = React.useState(
    value === undefined || value === null ? '' : value
  )
  useDebounce(
    () => {
      if (
        (rawValue === '' && (value === undefined || value === null)) ||
        rawValue === value
      )
        return
      setValue && setValue(rawValue)
    },
    debounceMs,
    [rawValue]
  )

  // Propagate pending changes up when we unfocus
  const toggleFocusHandler = useCallback(() => {
    if (!_.isEqual(value, rawValue)) {
      if (setValue) setValue(rawValue)
    }
  }, [value, rawValue, setValue])

  // Propagate any changes down
  useEffect(() => {
    if (!_.isEqual(value, rawValue)) {
      setRawValue(value || '')
    }
  }, [value])

  return (
    <RawFloatingLabelInput
      p="3"
      isRequired
      borderRadius="4"
      label={label}
      labelColor={'#6b7280'}
      defaultValue={defaultValue}
      value={rawValue}
      onChangeText={setRawValue}
      labelBGColor={'#fff'}
      borderColor="coolGray.200"
      fontSize="sm"
      fontWeight="medium"
      containerWidth={containerW}
      w={w}
      isReadOnly={isReadOnly}
      placeholder={placeholder}
      mt={mt}
      toggleFocusHandler={toggleFocusHandler}
    />
  )
}
