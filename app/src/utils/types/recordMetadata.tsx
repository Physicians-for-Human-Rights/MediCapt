import { z } from 'zod'
import { dateSchema, s3PresignedPost } from 'utils/types/common'
import _ from 'lodash'

/// Record metadata

export const recordMetadataSchemaByUser = z
  .object({
    'storage-version': z.literal('1.0.0'),
    formUUID: z.string().nonempty(),
    formID: z.string().nonempty(),
    formVersion: z.string().nonempty(),
    locationID: z.string().nonempty(),
    locationUUID: z.string().optional(), // TODO make me not optional
    // We may not know this information
    patientName: z.string(),
    patientGender: z.string(),
    patientAddress: z.string(),
    patientDateOfBirth: dateSchema,
    patientPhoneNumber: z.string(),
    patientEmail: z.string(),
    incidentDate: dateSchema,
    // This is a link to some external case id, if it exists
    caseId: z.string(),
    manifestMD5: z.string(),
    manifestHash: z.string(),
    associatedRecords: z.array(
      z.object({
        recordUUID: z.string().nonempty(),
        recordID: z.string().nonempty(),
        pathInRecord: z.string().optional(),
        tags: z.string().optional(),
        title: z.string().optional(),
        comment: z.string().optional(),
      })
    ),
    // This is controlled by the user only on initialization. After that, it is
    // ignored.
    isAssociatedRecord: z.boolean().optional(),
    // This is never used by any part of the system. It eists only to avoid race
    // conditions in record creation.
    userScopedLocalUUID: z.string().optional(),
  })
  .strict()

export const recordPatchSchema = z.discriminatedUnion('patchType', [
  z.object({
    patchType: z.literal('text-diff'),
    fileSHA256: z.string(),
    diff: z.string(),
  }),
  z.object({
    patchType: z.literal('json-patch'),
    fileSHA256: z.string(),
    jsonPatch: z.string(),
  }),
])

export const recordMetadataSchema = recordMetadataSchemaByUser
  .extend({
    'storage-version': z.literal('1.0.0'),
    recordUUID: z.string().nonempty(),
    recordID: z.string().nonempty(),
    patientUUID: z.string().nonempty(),
    patientID: z.string().nonempty(),
    createdDate: dateSchema,
    createdByUUID: z.string().nonempty(),
    lastChangedDate: dateSchema,
    lastChangedByUUID: z.string().nonempty(),
    version: z.string().nonempty(),
    sealed: z.boolean(),
    sealedByUUID: z.string().optional(),
    sealedDate: dateSchema.optional(),
    previousManifestHash: z.string().optional(),
    patches: z.array(recordPatchSchema),
  })
  .strict()

// Manifests of various types

export const recordManifestFileSchema = z.object({
  sha256: z.string().nonempty(),
  filetype: z.string().nonempty(),
  filename: z.string().nonempty(),
})

export const recordManifestSchema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    contents: z.array(recordManifestFileSchema),
    root: z.string(),
  })
  .strict()

export const recordManifestFileWithMD5Schema = recordManifestFileSchema.extend({
  md5: z.string().nonempty(),
})

export const recordManifestWithMD5Schema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    contents: z.array(recordManifestFileWithMD5Schema),
    root: z.string(),
  })
  .strict()

export const recordManifestFileWithPostLinkSchema =
  recordManifestFileSchema.extend({
    link: s3PresignedPost,
  })

export const recordManifestWithPostLinksSchema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    contents: z.array(recordManifestFileWithPostLinkSchema),
    root: z.string(),
  })
  .strict()

export const recordManifestFileWithLinkSchema = recordManifestFileSchema.extend(
  {
    link: z.string().nonempty(),
  }
)

export const recordManifestWithLinksSchema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    contents: z.array(recordManifestFileWithLinkSchema),
    root: z.string(),
  })
  .strict()

export const recordManifestFileWithDataSchema = recordManifestFileSchema.extend(
  {
    md5: z.string().nonempty(),
    data: z.string().nonempty(),
  }
)

export const recordManifestWithDataSchema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    contents: z.array(recordManifestFileWithDataSchema),
    root: z.string(),
  })
  .strict()

// These are internal
//
// There are three types of records. Latest entries, historical
// versions, and deleted entries (deleted replace latest).

export const recordSchemaDynamoLatestToUpdatePart = z.object({
  GPK2: z.literal('VERSION#latest'),
  GSK2: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'DATE#'), {
      message: 'GSK2 must start with DATE#',
    }),
  GPK3: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'LO#'), {
      message: 'GPK2 must start with LA#',
    }),
  GSK3: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'DATE#'), {
      message: 'GSK2 must start with DATE#',
    }),
  GPK4: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'CREATEDBY#'), {
      message: 'GPK3 must start with CA#',
    }),
  GSK4: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'DATE#'), {
      message: 'GSK3 must start with DATE#',
    }),
  GPK5: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'UPDATEDBY#'), {
      message: 'GPK4 must start with LO#',
    }),
  GSK5: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'DATE#'), {
      message: 'GSK4 must start with DATE#',
    }),
})

export const recordSchemaDynamoLatestPart =
  recordSchemaDynamoLatestToUpdatePart.extend({
    PK: z
      .string()
      .nonempty()
      .refine(v => _.startsWith(v, 'RECORD#'), {
        message: 'Primary key must start with RECORD#',
      }),
    SK: z.literal('VERSION#latest'),
    GPK1: z
      .string()
      .nonempty()
      .refine(v => _.startsWith(v, 'RECORD#'), {
        message: 'GSK1 must start with RECORD#',
      }),
    GSK1: z.literal('VERSION#latest'),
  })

export const recordSchemaDynamoDeletedPart = z.object({
  SK: z.literal('VERSION#deleted'),
  GPKV: z.literal('VERSION#deleted'),
})

export const recordSchemaDynamoLatest = recordMetadataSchema.merge(
  recordSchemaDynamoLatestPart
)

export const recordSchemaDynamoDeleted = recordSchemaDynamoLatest.merge(
  recordSchemaDynamoDeletedPart
)

// Entries we must update when we change a record, but that do not come from
// users
export const recordSchemaDynamoUpdate = recordMetadataSchemaByUser
  .extend({
    lastChangedByUUID: z.string().nonempty().uuid(),
    lastChangedDate: dateSchema,
    version: z.string().nonempty(),
  })
  .strict()

export const recordSchemaDynamoLatestUpdate = recordSchemaDynamoUpdate.merge(
  recordSchemaDynamoLatestPart
)

export const recordSchemaDynamoLatestToUpdate =
  recordSchemaDynamoLatestToUpdatePart.merge(recordSchemaDynamoUpdate).strict()

export const recordSchemaUpdateSeal = z
  .object({
    lastChangedByUUID: z.string().nonempty().uuid(),
    lastChangedDate: dateSchema,
    version: z.string().nonempty(),
    sealed: z.boolean(),
  })
  .strict()

//

export type RecordMetadataByUser = z.infer<typeof recordMetadataSchemaByUser>
export type RecordMetadata = z.infer<typeof recordMetadataSchema>

export type RecordManifestFile = z.infer<typeof recordManifestFileSchema>
export type RecordManifest = z.infer<typeof recordManifestSchema>
export type RecordManifestFileWithMD5 = z.infer<
  typeof recordManifestFileWithMD5Schema
>
export type RecordManifestWithMD5 = z.infer<typeof recordManifestWithMD5Schema>
export type RecordManifestFileWithPostLink = z.infer<
  typeof recordManifestFileWithPostLinkSchema
>
export type RecordManifestWithPostLinks = z.infer<
  typeof recordManifestWithPostLinksSchema
>
export type RecordManifestFileWithLink = z.infer<
  typeof recordManifestFileWithLinkSchema
>
export type RecordManifestWithLinks = z.infer<
  typeof recordManifestWithLinksSchema
>
export type RecordManifestFileWithData = z.infer<
  typeof recordManifestFileWithDataSchema
>
export type RecordManifestWithData = z.infer<
  typeof recordManifestWithDataSchema
>

export type RecordPostServer = {
  metadata: RecordMetadata
  manifest: RecordManifestWithPostLinks
}
export type RecordGetServer = {
  metadata: RecordMetadata
  manifest: RecordManifestWithLinks
}

export type RecordDynamoLatestType = z.infer<typeof recordSchemaDynamoLatest>
export type RecordDynamoDeletedType = z.infer<typeof recordSchemaDynamoDeleted>

export type RecordDynamoUpdateType = z.infer<typeof recordSchemaDynamoUpdate>

export type RecordDynamoLatestUpdateType = z.infer<
  typeof recordSchemaDynamoLatestUpdate
>

export type RecordDynamoLatestToUpdateType = z.infer<
  typeof recordSchemaDynamoLatestToUpdate
>

export type RecordDynamoUpdateSeal = z.infer<typeof recordSchemaUpdateSeal>
