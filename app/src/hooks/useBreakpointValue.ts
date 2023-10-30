import { useWindowDimensions } from 'react-native'
import {
  getClosestBreakpoint,
  hasValidBreakpointFormat,
  findLastValidBreakpoint,
} from './tools/util'
import { breakpoints } from '../components/nativeBaseSpec'
// import type { ITheme } from '../theme/index'
// export const breakpoints = {
//   base: 0,
//   sm: 480,
//   md: 768,
//   lg: 992,
//   xl: 1280,
//   '2xl': 1536,
// }

export type IBreakpoint = keyof typeof breakpoints

// type UseBreakpointValueParam =
//   | { [key in keyof ITheme['breakpoints']]?: any }
//   | Array<any>

export function useBreakpointValue(values: any) {
  let windowWidth = useWindowDimensions()?.width

  if (hasValidBreakpointFormat(values, breakpoints)) {
    let currentBreakpoint = getClosestBreakpoint(breakpoints, windowWidth)
    return findLastValidBreakpoint(values, breakpoints, currentBreakpoint)
  } else {
    return values
  }
}
