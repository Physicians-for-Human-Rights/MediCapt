import { z } from 'zod'

////// Some shared common types

// Dates are annoying in Zod. They serialize to strings in JSON, so you start
// with a Date, you serialzie to string, and then on the receiving side with Zod
// there's no good decoding. It's neither a string nor a Date. We could type
// this as string|Date, but that would complicate all of the other
// code. Instead, we use a preprocessor to convert the string input to a date.
export const dateSchema = z.preprocess(arg => {
  if (typeof arg == 'string' || arg instanceof Date) return new Date(arg)
}, z.date())

export type DateSchema = z.infer<typeof dateSchema>

////// This part is for internal services

// HumanID service

export type HumanIDAction =
  | {
      action: 'machineID-to-humanID'
      machineID: string
      suggestedPrefix: string
    }
  | {
      action: 'humanID-to-machineID'
      humanID: string
    }

export type HumanIDResponse =
  | { humanID: string; machineID: string }
  | { failure: 'NOT_FOUND' }

////// The base types here are shared with the frontend, but the backend versions are private

export const userSchema = z.object({
  'storage-version': z.literal('1.0.0'),
  userUUID: z.string().nonempty(),
  userID: z.string().nonempty(),
  created_time: z.date(),
  last_updated_time: z.date(),
  email: z.string().nonempty(),
  birthdate: z.string().nonempty(),
  name: z.string().nonempty(),
  nickname: z.string().nonempty(),
  formal_name: z.string().nonempty(),
  gender: z.string().nonempty(),
  phone_number: z.string().nonempty(),
  official_id_type: z.string().nonempty(),
  official_id_code: z.string().nonempty(),
  official_id_expires: z.string().nonempty(),
  official_id_image: z.string().nonempty(),
  country: z.string().nonempty(),
  language: z.string().nonempty(),
  expiryDate: z.string().nonempty(),
  allowed_locations: z.array(z.string()),
  created_by: z.string().nonempty(),
})

export type UserType = z.infer<typeof userSchema>

//

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
    email: z
      .string()
      .email()
      .nonempty(),
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

//

export const recordMetadataSchema = z.object({
  recordUUID: z.string().nonempty(),
  recordID: z.string().nonempty(),
  locationUUID: z.string().nonempty(),
  createdDate: z.date(),
  providerCreatedUUID: z.string().nonempty(),
  formUUID: z.string().nonempty(),
  formName: z.string().nonempty(),
  formTags: z.string().nonempty(),
  formVersion: z.string().nonempty(),
  completed: z.boolean(),
  completedDate: z.date().nullable(),
  providerCompletedUUID: z.string().nonempty(),
  lastChangedDate: z.date(),
  providerLastChangedUUID: z.string().nonempty(),
  patientName: z.string().nonempty(),
  patientGender: z.string().nonempty(),
  patientAge: z.string().nonempty(),
  patientUUID: z.string().nonempty(),
  caseId: z.string().nonempty(),
  recordStorageVersion: z.literal('1.0.0'),
})

export type RecordMetadata = z.infer<typeof recordMetadataSchema>

//

export const formMetadataSchema = z.object({
  country: z.string().nonempty(),
  formUUID: z.string().nonempty(),
  formID: z.string().nonempty(),
  locationUUID: z.string().nonempty(),
  language: z.string().nonempty(),
  officialName: z.string().nonempty(),
  title: z.string().nonempty(),
  subtitle: z.string().nonempty(),
  createdDate: z.date(),
  formId: z.string().nonempty(),
  priority: z.string().nonempty(),
  version: z.string().nonempty(),
  createdByUUID: z.string().nonempty(),
  approvedByUUID: z.string().nonempty(),
  enabled: z.boolean(),
  enabledDate: z.date(),
  enabledSetByUUID: z.string().nonempty(),
  tags: z.string().nonempty(),
  formStorageVersion: z.literal('1.0.0'),
})

export type FormMetadata = z.infer<typeof formMetadataSchema>
