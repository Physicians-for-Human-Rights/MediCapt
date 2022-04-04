import { z } from 'zod'
import { dateSchema } from 'utils/types/common'

export const locationSchema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    locationUUID: z.string().nonempty(),
    locationID: z.string().nonempty(),
    country: z.string().length(2),
    language: z.string().length(2),
    legalName: z.string().nonempty(),
    shortName: z.string().nonempty(),
    entityType: z.string().nonempty(),
    address: z.string().nonempty(),
    mailingAddress: z.string().nonempty(),
    coordinates: z.string().nonempty(),
    phoneNumber: z.string().nonempty(),
    email: z.string().email().nonempty(),
    createdDate: dateSchema,
    createdByUUID: z.string().nonempty(),
    lastChangedByUUID: z.string().nonempty(),
    lastChangedDate: dateSchema,
    enabled: z.boolean(),
    enabledDate: dateSchema,
    enabledSetByUUID: z.string().nonempty(),
    tags: z.string().optional(),
    version: z.string().nonempty(),
  })
  .strict()

export type LocationType = z.infer<typeof locationSchema>

export const locationCreationSchema = locationSchema
  .omit({
    createdDate: true,
    createdByUUID: true,
    version: true,
    lastChangedByUUID: true,
    lastChangedDate: true,
    locationUUID: true,
    locationID: true,
    enabled: true,
    enabledDate: true,
    enabledSetByUUID: true,
  })
  .strip()

export type LocationCreationType = z.infer<typeof locationCreationSchema>
