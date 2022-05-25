import { z } from 'zod'
import { dateSchema, stringSetSchema } from 'utils/types/common'
import _ from 'lodash'

export const locationEntityTypes = [
  'medical-facility',
  'police-station',
  'refugee-camp',
] as const

// This part of the location object is controllable by users
export const locationSchemaByUser = z
  .object({
    // Despite the name, the storage-version is not controlled by users. But, we
    // still need to version this schema. In any case, by making it a literal we
    // forbid users from doing anything useful with it.
    'storage-version': z.literal('1.0.0'),
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
    email: z
      .string()
      .email()
      .nonempty(),
    enabled: z.boolean(),
    tags: stringSetSchema,
  })
  .strip()

// The remainder of the location object can be read by users, but cannot be
// changed
export const locationSchema = locationSchemaByUser
  .extend({
    'storage-version': z.literal('1.0.0'),
    locationUUID: z
      .string()
      .nonempty()
      .uuid(),
    locationID: z.string().nonempty(),
    createdDate: dateSchema,
    createdByUUID: z
      .string()
      .nonempty()
      .uuid(),
    lastChangedByUUID: z
      .string()
      .nonempty()
      .uuid(),
    lastChangedDate: dateSchema,
    version: z.string().nonempty(),
  })
  .strict()

export const locationSchemaStrip = locationSchema.strip()

// These are internal
//
// There are three types of location records. Latest entries, historical
// versions, and deleted entries (deleted replace latest).

export const locationSchemaDynamoLatestToUpdatePart = z.object({
  GSK2: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'DATE#'), {
      message: 'GSK2 must start with DATE#',
    }),
  GPK3: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'LA#'), {
      message: 'GPK3 must start with LA#',
    }),
  GSK3: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'DATE#'), {
      message: 'GSK3 must start with DATE#',
    }),
  GPK4: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'CA#'), {
      message: 'GPK4 must start with CA#',
    }),
  GSK4: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'DATE#'), {
      message: 'GSK4 must start with DATE#',
    }),
  GPK5: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'ET#'), {
      message: 'GPK5 must start with ET#',
    }),
  GSK5: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'DATE#'), {
      message: 'GSK5 must start with DATE#',
    }),
})

export const locationSchemaDynamoLatestPart = locationSchemaDynamoLatestToUpdatePart.extend(
  {
    PK: z
      .string()
      .nonempty()
      .refine(v => _.startsWith(v, 'LOCATION#'), {
        message: 'Primary key must start with LOCATION#',
      }),
    SK: z.literal('VERSION#latest'),
    GPK1: z
      .string()
      .nonempty()
      .refine(v => _.startsWith(v, 'LOCATION#'), {
        message: 'GSK1 must start with LOCATION#',
      }),
    GSK1: z.literal('VERSION#latest'),
    GPK2: z.literal('VERSION#latest'),
  }
)

export const locationSchemaDynamoDeletedPart = z.object({
  SK: z.literal('VERSION#deleted'),
  GPKV: z.literal('VERSION#deleted'),
})

export const locationSchemaDynamoVersionPart = z.object({
  PK: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'LOCATION#'), {
      message: 'Primary key must start with LOCATION#',
    }),
  SK: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'VERSION#'), {
      message: 'Secondary key must start with VERSION#',
    }),
})

export const locationSchemaDynamoLatest = locationSchema.merge(
  locationSchemaDynamoLatestPart
)

export const locationSchemaDynamoDeleted = locationSchemaDynamoLatest.merge(
  locationSchemaDynamoDeletedPart
)

export const locationSchemaDynamoVersion = locationSchema.merge(
  locationSchemaDynamoVersionPart
)

// Entries we must update when we change a location, but that do not come from
// users
export const locationSchemaDynamoUpdate = locationSchemaByUser
  .extend({
    lastChangedByUUID: z
      .string()
      .nonempty()
      .uuid(),
    lastChangedDate: dateSchema,
    version: z.string().nonempty(),
  })
  .strict()

export const locationSchemaDynamoLatestUpdate = locationSchemaDynamoUpdate.merge(
  locationSchemaDynamoLatestPart
)

export const locationSchemaDynamoLatestToUpdate = locationSchemaDynamoLatestToUpdatePart
  .merge(locationSchemaDynamoUpdate)
  .strict()

//

export type LocationType = z.infer<typeof locationSchema>

export type LocationByUserType = z.infer<typeof locationSchemaByUser>

export type LocationDynamoLatestType = z.infer<
  typeof locationSchemaDynamoLatest
>
export type LocationDynamoVersionType = z.infer<
  typeof locationSchemaDynamoVersion
>
export type LocationDynamoDeletedType = z.infer<
  typeof locationSchemaDynamoDeleted
>

export type LocationDynamoUpdateType = z.infer<
  typeof locationSchemaDynamoUpdate
>

export type LocationDynamoLatestUpdateType = z.infer<
  typeof locationSchemaDynamoLatestUpdate
>

export type LocationDynamoLatestToUpdateType = z.infer<
  typeof locationSchemaDynamoLatestToUpdate
>
