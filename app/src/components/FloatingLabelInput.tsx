import React, { Component, useCallback, useEffect } from 'react'
import useDebounce from 'react-use/lib/useDebounce'
import { Platform, Animated } from 'react-native'
import { Input, Box } from 'native-base'
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

  componentDidUpdate() {
    Animated.timing(this._animatedIsFocused, {
      duration: 200,
      useNativeDriver: false,
      toValue: this.state.isFocused || this.props.defaultValue !== '' ? 1 : 0,
    }).start()
  }

  render() {
    const { label, ...props } = this.props
    const lableContainerStyles = {
      position: 'absolute',
      left: 16,
      top: this._animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [16, -7],
      }),
      zIndex: 5,
      paddingLeft: 3,
      paddingRight: 3,
      backgroundColor: this.props.labelBGColor,
    } as any
    const AndroidlabelStyle = {
      fontWeight: '500',
      fontSize: this._animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 12],
      }),

      color: this.props.labelColor,
    } as any
    const IOSlabelStyle = {
      fontWeight: '500',
      fontSize: this._animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [13, 12],
      }),

      marginTop: this._animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [-3, 0],
      }),
      color: this.props.labelColor,
    } as any
    return (
      <Box w={this.props.containerWidth} m={3} mt={this.props.mt}>
        <Animated.View pointerEvents="none" style={lableContainerStyles}>
          <Animated.Text
            style={
              Platform.OS === 'android' ? AndroidlabelStyle : IOSlabelStyle
            }
          >
            {label}
          </Animated.Text>
        </Animated.View>
        <Input
          {...props}
          mt={0}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          padding="3"
          _hover={{ bg: this.props.labelBGColor }}
        />
      </Box>
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
