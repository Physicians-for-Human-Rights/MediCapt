import { z } from 'zod'
import { dateSchema } from 'utils/types/common'
import _ from 'lodash'

export const locationEntityTypes = [
  'medical-facility',
  'police-station',
  'refugee-camp',
] as const

export const locationSchema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    locationUUID: z.string().nonempty(),
    locationID: z.string().nonempty(),
    country: z.string().length(2),
    language: z.string().length(2),
    legalName: z.string().nonempty(),
    shortName: z.string().nonempty(),
    entityType: z.enum(locationEntityTypes),
    address: z.string().nonempty(),
    mailingAddress: z.string().nonempty(),
    coordinates: z
      .string()
      .nonempty()
      .refine(
        v => {
          const list = _.split(v, ',')
          if (list.length !== 2) return false
          const [l, r] = list
          return !_.isNaN(_.toNumber(l)) && !_.isNaN(_.toNumber(r))
        },
        {
          message:
            'Coordinates must be 2 numbers separated by a comma like 42.34089818841653, -71.08180417092166',
        }
      ),
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
    deleted: z.boolean(),
    version: z.string().nonempty(),
  })
  .strict()

export const locationSchemaStrip = locationSchema.strip()

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
