import { z } from 'zod'
import _ from 'lodash'

// Dates serialize to strings in JSON, so you start
// with a Date, you serialzie to string, and then on the receiving side with Zod
// there's no good decoding. It's neither a string nor a Date. We could type
// this as string|Date, but that would complicate all of the other
// code. Instead, we use a preprocessor to convert the string input to a date.
export const dateSchema = z.preprocess(arg => {
  if (typeof arg == 'string' || arg instanceof Date) return new Date(arg)
}, z.date())

// String sets serialize to lists of strings in JSON. Same issue as with
// Date. This converts back to a Set.
export const stringSetSchema = z.preprocess(arg => {
  if (_.isSet(arg)) return arg
  if (_.isArray(arg)) return new Set(arg)
  if (_.isEmpty(arg)) return new Set()
}, z.set(z.string()))
