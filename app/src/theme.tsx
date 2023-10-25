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

// Heading native base
// xl: 36
// lg: 30
// md: 20
// sm: 16
// xs: 14

// kitten
// h1: 36
// h2: 32
// h3: 30
// h4: 26
// h5: 22
// h6: 18
// s1: 15
// md is translated into h5
