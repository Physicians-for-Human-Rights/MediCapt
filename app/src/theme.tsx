import { extendTheme, NativeBaseProvider } from 'native-base'
import 'styling'

const newColorTheme = {
  brand: {
    900: '#8287af',
    800: '#7c83db',
    700: '#b3bef6',
  },
}

export const theme = extendTheme({ colors: newColorTheme })

// TODO Remove this after the nativebase switch

const medicaptRed = '#d5001c'

export default {
  ListItem: {
    containerStyle: {
      borderTopWidth: 2,
      borderBottomWidth: 2,
    },
  },
  Button: {
    /* TODO */
    /* buttonStyle: {
     *     backgroundColor: "red"
     * } */
  },
}
