import { z } from 'zod'

// Dates are annoying in Zod. They serialize to strings in JSON, so you start
// with a Date, you serialzie to string, and then on the receiving side with Zod
// there's no good decoding. It's neither a string nor a Date. We could type
// this as string|Date, but that would complicate all of the other
// code. Instead, we use a preprocessor to convert the string input to a date.
export const dateSchema = z.preprocess(arg => {
  if (typeof arg == 'string' || arg instanceof Date) return new Date(arg)
}, z.date())

export type DateSchema = z.infer<typeof dateSchema>
