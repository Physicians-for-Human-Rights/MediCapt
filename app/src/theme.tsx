import { extendTheme } from 'native-base'
import { theme as defaultTheme } from 'native-base'
import 'styling'

export const theme = extendTheme({
  // NB node_modules/native-base/src/theme/base/colors.ts
  colors: {
    primary: defaultTheme.colors.red,
    secondary: defaultTheme.colors.cyan,
    danger: defaultTheme.colors.fuchsia,
  },
})

// NB Most similar to red.600
export const medicaptRed = '#d5001c'
