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
    // We may not know this information
    patientName: z.string(),
    patientGender: z.string(),
    patientAge: z.string(),
    // This is a link to some external case id, if it exists
    caseId: z.string(),
    manifestHash: z.string(),
    manifestMD5: z.string(),
  })
  .strict()

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
  })
  .strict()

export const recordMetadataSchemaStrip = recordMetadataSchema.strip()

// Manifests of various types

export const recordFileWithMD5Schema = z.object({
  sha256: z.string().nonempty(),
  md5: z.string().nonempty(),
  filetype: z.string().nonempty(),
  filename: z.string().nonempty(),
})

export const recordManifestWithMD5Schema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    contents: z.array(recordFileWithMD5Schema),
    root: z.string(),
  })
  .strict()

export const recordFileSchema = z.object({
  sha256: z.string().nonempty(),
  filetype: z.string().nonempty(),
  filename: z.string().nonempty(),
})

export const recordManifestSchema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    contents: z.array(recordFileSchema),
    root: z.string(),
  })
  .strict()

export const recordFileWithPostLinkSchema = z.object({
  sha256: z.string().nonempty(),
  filetype: z.string().nonempty(),
  link: s3PresignedPost,
  filename: z.string().nonempty(),
})

export const recordManifestWithPostLinksSchema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    root: z.string(),
    contents: z.array(recordFileWithPostLinkSchema),
  })
  .strict()

export const recordFileWithLinkSchema = z.object({
  sha256: z.string().nonempty(),
  filetype: z.string().nonempty(),
  link: z.string().nonempty(),
  filename: z.string().nonempty(),
})

export const recordManifestWithLinksSchema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    root: z.string(),
    contents: z.array(recordFileWithLinkSchema),
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

export const recordSchemaDynamoVersionPart = z.object({
  PK: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'RECORD#'), {
      message: 'Primary key must start with RECORD#',
    }),
  SK: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'VERSION#'), {
      message: 'Secondary key must start with VERSION#',
    }),
})

export const recordSchemaDynamoLatest = recordMetadataSchema.merge(
  recordSchemaDynamoLatestPart
)

export const recordSchemaDynamoDeleted = recordSchemaDynamoLatest.merge(
  recordSchemaDynamoDeletedPart
)

export const recordSchemaDynamoVersion = recordMetadataSchema.merge(
  recordSchemaDynamoVersionPart
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
export type RecordFile = z.infer<typeof recordFileSchema>
export type RecordManifest = z.infer<typeof recordManifestSchema>
export type RecordFileWithMD5Schema = z.infer<typeof recordFileWithMD5Schema>
export type RecordFileWithLink = z.infer<typeof recordFileWithLinkSchema>
export type RecordManifestWithMD5 = z.infer<typeof recordManifestWithMD5Schema>
export type RecordManifestWithLinks = z.infer<
  typeof recordManifestWithLinksSchema
>
export type RecordFileWithPostLink = z.infer<
  typeof recordFileWithPostLinkSchema
>
export type RecordManifestWithPostLinks = z.infer<
  typeof recordManifestWithPostLinksSchema
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
export type RecordDynamoVersionType = z.infer<typeof recordSchemaDynamoVersion>
export type RecordDynamoDeletedType = z.infer<typeof recordSchemaDynamoDeleted>

export type RecordDynamoUpdateType = z.infer<typeof recordSchemaDynamoUpdate>

export type RecordDynamoLatestUpdateType = z.infer<
  typeof recordSchemaDynamoLatestUpdate
>

export type RecordDynamoLatestToUpdateType = z.infer<
  typeof recordSchemaDynamoLatestToUpdate
>

export type RecordDynamoUpdateSeal = z.infer<typeof recordSchemaUpdateSeal>

export const recordFileWithDataSchema = z.object({
  sha256: z.string().nonempty(),
  md5: z.string().nonempty(),
  filename: z.string().nonempty(),
  data: z.string().nonempty(),
  filetype: z.string().nonempty(),
})

export const recordManifestWithDataSchema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    contents: z.array(recordFileWithDataSchema),
    root: z.string(),
  })
  .strict()

export type RecordFileWitDataSchema = z.infer<typeof recordFileWithDataSchema>
export type RecordManifestWithData = z.infer<
  typeof recordManifestWithDataSchema
>
