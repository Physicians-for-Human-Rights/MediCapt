import { z } from 'zod'
import { dateSchema, s3PresignedPost } from 'utils/types/common'
import _ from 'lodash'
import { FormGetServer } from 'utils/types/formMetadata'
import { RecordGetServer } from 'utils/types/recordMetadata'

export const shareSchemaByUser = z
  .object({
    // Despite the name, the storage-version is not controlled by users. But, we
    // still need to version this schema. In any case, by making it a literal we
    // forbid users from doing anything useful with it.
    'storage-version': z.literal('1.0.0'),
    //
    recordUUID: z.string().nonempty(),
    recordID: z.string().nonempty(),
    locationID: z.string().nonempty(),
    locationUUID: z.string().nonempty(),
    //
    formUUID: z.string().nonempty(),
    formID: z.string().nonempty(),
    formVersion: z.string().nonempty(),
    formTitle: z.string().nonempty(),
    formSubtitle: z.string().nonempty(),
    formTags: z.string().nonempty(),
    formOfficialName: z.string().nonempty(),
    formOfficialCode: z.string().nonempty(),
    //
    sharedWithUUID: z.string().nonempty(),
    sharedWithUUIDUserType: z.string().nonempty(),
    shareExpiresOn: dateSchema,
    // We may not know this information
    // This information will be populated when the share is created
    // It will not change otherwise
    patientName: z.string(),
    patientGender: z.string(),
    patientAddress: z.string(),
    patientDateOfBirth: dateSchema,
    patientPhoneNumber: z.string(),
    patientEmail: z.string(),
    incidentDate: dateSchema,
    caseId: z.string(),
  })
  .strict()

export const shareSchema = shareSchemaByUser
  .extend({
    'storage-version': z.literal('1.0.0'),
    shareUUID: z.string().nonempty(),
    shareID: z.string().nonempty(),
    createdDate: dateSchema,
    createdByUUID: z.string().nonempty(),
    lastChangedDate: dateSchema,
    lastChangedByUUID: z.string().nonempty(),
  })
  .strict()

export const shareSchemaStrip = shareSchema.strip()

// These are internal
//
// There are three types of shares. Latest entries, historical
// versions, and deleted entries (deleted replace latest).

export const shareSchemaDynamoToUpdatePart = z.object({
  PK: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'BY#'), {
      message: 'Primary key must start with BY#',
    }),
  SK: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'ID#'), {
      message: 'Primary key must start with ID#',
    }),
  GPK1: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'BY#'), {
      message: 'GSK1 must start with BY#',
    }),
  GSK1: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'DATE#'), {
      message: 'GSK1 must start with DATE#',
    }),
  GPK2: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'WITH#'), {
      message: 'GSK1 must start with WITH#',
    }),
  GSK2: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'ID#'), {
      message: 'GSK2 must start with ID#',
    }),
  GPK3: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'WITH#'), {
      message: 'GPK3 must start with WITH#',
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
    .refine(v => _.startsWith(v, 'RECORD#'), {
      message: 'GPK4 must start with RECORD#',
    }),
  GSK4: z
    .string()
    .nonempty()
    .refine(v => _.startsWith(v, 'DATE#'), {
      message: 'GSK4 must start with DATE#',
    }),
  TTL: z.number(),
})

// Entries we must update when we change a share, but that do not come from
// users
export const shareSchemaDynamoUpdate = shareSchemaByUser
  .extend({
    lastChangedByUUID: z.string().nonempty().uuid(),
    lastChangedDate: dateSchema,
  })
  .strict()

export const shareSchemaDynamoToUpdate = shareSchemaDynamoUpdate.merge(
  shareSchemaDynamoToUpdatePart
)

//

export type ShareByUser = z.infer<typeof shareSchemaByUser>
export type Share = z.infer<typeof shareSchema>

export type ShareDynamoUpdateType = z.infer<typeof shareSchemaDynamoUpdate>

export type ShareDynamoToUpdateType = z.infer<typeof shareSchemaDynamoToUpdate>

export type ShareGetServer = {
  share: Share
  form: FormGetServer
  record: RecordGetServer
}
