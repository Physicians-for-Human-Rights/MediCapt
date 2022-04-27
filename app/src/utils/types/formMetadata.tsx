import { z } from 'zod'
import { dateSchema, s3PresignedPost } from 'utils/types/common'
import _ from 'lodash'

/// Form metadata

export const formMetadataSchemaByUser = z
  .object({
    // Despite the name, the storage-version is not controlled by users. But, we
    // still need to version this schema. In any case, by making it a literal we
    // forbid users from doing anything useful with it.
    'storage-version': z.literal('1.0.0'),
    country: z.string().nonempty(),
    locationID: z.string().nonempty(),
    language: z.string().nonempty(),
    'official-name': z.string().nonempty(),
    'official-code': z.string(),
    title: z.string().nonempty(),
    subtitle: z.string().nonempty(),
    priority: z.string().nonempty(),
    enabled: z.boolean(),
    tags: z.string().nonempty(),
    manifestHash: z.string(),
    manifestMD5: z.string(),
  })
  .strict()

export const formMetadataSchema = formMetadataSchemaByUser
  .extend({
    'storage-version': z.literal('1.0.0'),
    formUUID: z.string().nonempty(),
    formID: z.string().nonempty(),
    createdDate: dateSchema,
    createdByUUID: z.string().nonempty(),
    lastChangedDate: dateSchema,
    lastChangedByUUID: z.string().nonempty(),
    version: z.string().nonempty(),
  })
  .strict()

export const formMetadataSchemaStrip = formMetadataSchema.strip()

export const formFileWithMD5Schema = z.object({
  sha256: z.string().nonempty(),
  md5: z.string().nonempty(),
  filetype: z.string().nonempty(),
  filename: z.string().nonempty(),
})

export const formManifestWithMD5Schema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    contents: z.array(formFileWithMD5Schema),
    root: z.string(),
  })
  .strict()

export const formFileSchema = z.object({
  sha256: z.string().nonempty(),
  filetype: z.string().nonempty(),
  filename: z.string().nonempty(),
})

export const formManifestSchema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    contents: z.array(formFileSchema),
    root: z.string(),
  })
  .strict()

export const formFileWithPostLinkSchema = z.object({
  sha256: z.string().nonempty(),
  filetype: z.string().nonempty(),
  link: s3PresignedPost,
  filename: z.string().nonempty(),
})

export const formManifestWithPostLinksSchema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    root: z.string(),
    contents: z.array(formFileWithPostLinkSchema),
  })
  .strict()

export const formFileWithLinkSchema = z.object({
  sha256: z.string().nonempty(),
  filetype: z.string().nonempty(),
  link: z.string().nonempty(),
  filename: z.string().nonempty(),
})

export const formManifestWithLinksSchema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    root: z.string(),
    contents: z.array(formFileWithLinkSchema),
  })
  .strict()

// These are internal
//
// There are three types of forms. Latest entries, historical
// versions, and deleted entries (deleted replace latest).

export const formSchemaDynamoLatestToUpdatePart = z.object({
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
    .refine(v => _.startsWith(v, 'LO#'), {
      message: 'GPK5 must start with LO#',
    }),
  GSK5: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'DATE#'), {
      message: 'GSK5 must start with DATE#',
    }),
})

export const formSchemaDynamoLatestPart =
  formSchemaDynamoLatestToUpdatePart.extend({
    PK: z
      .string()
      .nonempty()
      .refine(v => _.startsWith(v, 'FORM#'), {
        message: 'Primary key must start with FORM#',
      }),
    SK: z.literal('VERSION#latest'),
    GPK1: z
      .string()
      .nonempty()
      .refine(v => _.startsWith(v, 'FORM#'), {
        message: 'GSK1 must start with FORM#',
      }),
    GSK1: z.literal('VERSION#latest'),
    GPK2: z.literal('VERSION#latest'),
  })

export const formSchemaDynamoDeletedPart = z.object({
  SK: z.literal('VERSION#deleted'),
  GPKV: z.literal('VERSION#deleted'),
})

export const formSchemaDynamoVersionPart = z.object({
  PK: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'FORM#'), {
      message: 'Primary key must start with FORM#',
    }),
  SK: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'VERSION#'), {
      message: 'Secondary key must start with VERSION#',
    }),
})

export const formSchemaDynamoLatest = formMetadataSchema.merge(
  formSchemaDynamoLatestPart
)

export const formSchemaDynamoDeleted = formSchemaDynamoLatest.merge(
  formSchemaDynamoDeletedPart
)

export const formSchemaDynamoVersion = formMetadataSchema.merge(
  formSchemaDynamoVersionPart
)

// Entries we must update when we change a form, but that do not come from
// users
export const formSchemaDynamoUpdate = formMetadataSchemaByUser
  .extend({
    lastChangedByUUID: z.string().nonempty().uuid(),
    lastChangedDate: dateSchema,
    version: z.string().nonempty(),
  })
  .strict()

export const formSchemaDynamoLatestUpdate = formSchemaDynamoUpdate.merge(
  formSchemaDynamoLatestPart
)

export const formSchemaDynamoLatestToUpdate = formSchemaDynamoLatestToUpdatePart
  .merge(formSchemaDynamoUpdate)
  .strict()

//

export type FormMetadataByUser = z.infer<typeof formMetadataSchemaByUser>
export type FormMetadata = z.infer<typeof formMetadataSchema>
export type FormFile = z.infer<typeof formFileSchema>
export type FormManifest = z.infer<typeof formManifestSchema>
export type FormFileWithMD5Schema = z.infer<typeof formFileWithMD5Schema>
export type FormFileWithLink = z.infer<typeof formFileWithLinkSchema>
export type FormManifestWithMD5 = z.infer<typeof formManifestWithMD5Schema>
export type FormManifestWithLinks = z.infer<typeof formManifestWithLinksSchema>
export type FormFileWithPostLink = z.infer<typeof formFileWithPostLinkSchema>
export type FormManifestWithPostLinks = z.infer<
  typeof formManifestWithPostLinksSchema
>
export type FormPostServer = {
  metadata: FormMetadata
  manifest: FormManifestWithPostLinks
}
export type FormGetServer = {
  metadata: FormMetadata
  manifest: FormManifestWithLinks
}

export type FormDynamoLatestType = z.infer<typeof formSchemaDynamoLatest>
export type FormDynamoVersionType = z.infer<typeof formSchemaDynamoVersion>
export type FormDynamoDeletedType = z.infer<typeof formSchemaDynamoDeleted>

export type FormDynamoUpdateType = z.infer<typeof formSchemaDynamoUpdate>

export type FormDynamoLatestUpdateType = z.infer<
  typeof formSchemaDynamoLatestUpdate
>

export type FormDynamoLatestToUpdateType = z.infer<
  typeof formSchemaDynamoLatestToUpdate
>

export const formFileWithDataSchema = z.object({
  sha256: z.string().nonempty(),
  md5: z.string().nonempty(),
  filename: z.string().nonempty(),
  data: z.string().nonempty(),
  filetype: z.string().nonempty(),
})

export const formManifestWithDataSchema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    contents: z.array(formFileWithDataSchema),
    root: z.string(),
  })
  .strict()

export type FormFileWitDataSchema = z.infer<typeof formFileWithDataSchema>
export type FormManifestWithData = z.infer<typeof formManifestWithDataSchema>
