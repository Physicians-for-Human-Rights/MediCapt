import { z } from 'zod'

export const queryFilterMatchingSchema = z.union([
  z.object({ eq: z.string() }),
  z.object({ contains: z.string() }),
])

export type QueryFilterMatching = z.infer<typeof queryFilterMatchingSchema>

// TODO How do we restrict this to a particular type in zod, like
// QueryFilterForType?
export const queryFilterSchema = z.array(z.record(queryFilterMatchingSchema))

export type QueryFilter = z.infer<typeof queryFilterSchema>

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]

// TODO This isn't quite what we want. We want exactly one entry, not at least
// one entry. And we should check the type of the constraint. But, it does at
// least prevent typos in the object field name and helps autocomplete out.
export type QueryFilterForType<T> = AtLeastOne<
  Record<keyof T, z.infer<typeof queryFilterMatchingSchema>>
>[]

export const querySortSchema = z.array(
  z.union([z.object({ inc: z.string() }), z.object({ dec: z.string() })])
)

export type QuerySort = z.infer<typeof querySortSchema>
