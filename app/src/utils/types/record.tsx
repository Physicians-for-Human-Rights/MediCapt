import { z, ZodRawShape } from 'zod'
import { dateSchema } from './common'

// -------------------
//   Record Metadata
// -------------------

export const recordMetadataSchema = z
  .object({
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
  .strict()

export type RecordMetadata = z.infer<typeof recordMetadataSchema>

// -------------------
//  Record Value Types
// -------------------

export const recordPhotoSchema = z.object({
  uri: z.string().nonempty(),
  'date-taken': dateSchema.optional(),
})
export const imageAnnotationSchema = z.object({
  location: z.object({
    x: z.number().int().min(0).max(10000),
    y: z.number().int().min(0).max(10000),
  }),
  text: z.string(),
  photos: recordPhotoSchema.array(),
})
// export type MultipleFormValueTypes = string[] | number[] | boolean[]
export const multipleFormValueTypesSchema = z.union([
  z.string().array(),
  z.number().array(),
  z.boolean().array(),
])
// export type FormKVRawType = { key: string; value: SingleFormValueType }
export const formKVRawTypeSchema = z.object({
  key: z.string().nonempty(),
  value: z.union([z.string(), z.number(), z.boolean()]),
})

const skippableValueSchema = <T extends ZodRawShape>(shape: T) =>
  z.object({
    ...shape,
    skipped: z.boolean().optional(),
  })

export const recordValueByTypeSchema = {
  untyped: skippableValueSchema({
    type: z.undefined().optional(),
  }),
  bool: skippableValueSchema({
    type: z.literal('bool'),
    value: z.boolean(),
  }),
  number: skippableValueSchema({
    type: z.literal('number'),
    value: z.string(),
  }),
  text: skippableValueSchema({
    type: z.literal('text'),
    value: z.string(),
  }),
  'long-text': skippableValueSchema({
    type: z.literal('long-text'),
    value: z.string(),
  }),
  email: skippableValueSchema({
    type: z.literal('email'),
    value: z.string().email().nonempty(),
  }),
  address: skippableValueSchema({
    type: z.literal('address'),
    value: z.string().nonempty(),
  }),
  'phone-number': skippableValueSchema({
    type: z.literal('phone-number'),
    value: z.string().nonempty(),
  }),
  gender: skippableValueSchema({
    type: z.literal('gender'),
    value: z.string().nonempty(),
  }),
  sex: skippableValueSchema({
    type: z.literal('sex'),
    value: z.string(), // z.enum(['male', 'female', 'intersex']),
    skipped: z.boolean().optional(),
  }),
  date: skippableValueSchema({
    type: z.literal('date'),
    value: dateSchema,
  }),
  'date-time': skippableValueSchema({
    type: z.literal('date-time'),
    value: dateSchema,
  }),
  signature: skippableValueSchema({
    type: z.literal('signature'),
    value: z.string().nonempty(),
    signer: z.string().optional(),
    'date-signed': dateSchema.optional(),
  }),
  photo: skippableValueSchema({
    type: z.literal('photo'),
    value: recordPhotoSchema.array(),
  }),
  'body-image': skippableValueSchema({
    type: z.literal('body-image'),
    value: z.object({
      uri: z.string(),
      annotations: imageAnnotationSchema.array(),
    }),
  }),
  list: skippableValueSchema({
    type: z.literal('list'),
    value: z.object({
      options: multipleFormValueTypesSchema.nullable(),
      selection: z.string().nullable(),
      otherValue: z.string().nullable(),
    }),
  }),
  'list-with-labels': skippableValueSchema({
    type: z.literal('list-with-labels'),
    value: z.object({
      options: formKVRawTypeSchema.array().nullable(),
      selection: z.string().nullable(),
      otherValue: z.string().nullable(),
    }),
  }),
  'list-multiple': skippableValueSchema({
    type: z.literal('list-multiple'),
    value: z.object({
      options: multipleFormValueTypesSchema,
      selections: z.boolean().array(),
      otherChecked: z.boolean().optional(),
      otherValue: z.string().optional(),
    }),
  }),
  'list-with-labels-multiple': skippableValueSchema({
    type: z.literal('list-with-labels-multiple'),
    value: z.string(),
  }),
  'list-with-parts': skippableValueSchema({
    type: z.literal('list-with-parts'),
    value: z.string(),
  }),
  'repeat-list': skippableValueSchema({
    type: z.literal('repeat-list'),
    value: z.string().array(),
  }),
}
const RecordValueByType = z.object(recordValueByTypeSchema)

export const recordSimpleValueSchema = z.union([
  recordValueByTypeSchema['untyped'],
  recordValueByTypeSchema['bool'],
  recordValueByTypeSchema['number'],
  recordValueByTypeSchema['text'],
  recordValueByTypeSchema['long-text'],
  recordValueByTypeSchema['email'],
  recordValueByTypeSchema['address'],
  recordValueByTypeSchema['phone-number'],
  recordValueByTypeSchema['gender'],
  recordValueByTypeSchema['sex'],
  recordValueByTypeSchema['date'],
  recordValueByTypeSchema['date-time'],
  recordValueByTypeSchema['signature'],
  recordValueByTypeSchema['photo'],
  recordValueByTypeSchema['body-image'],
  recordValueByTypeSchema['list'],
  recordValueByTypeSchema['list-with-labels'],
  recordValueByTypeSchema['list-multiple'],
  recordValueByTypeSchema['list-with-labels-multiple'],
])

export type RecordPhoto = z.infer<typeof recordPhotoSchema>
export type ImageAnnotation = z.infer<typeof imageAnnotationSchema>
// export type MultipleFormValueTypes = z.infer<
//   typeof multipleFormValueTypesSchema
// >
// export type FormKVRawType = z.infer<typeof formKVRawTypeSchema>
export type RecordValueByType = z.infer<typeof RecordValueByType>
export type RecordSimpleValue = z.infer<typeof recordSimpleValueSchema>

// -------------------
//     Record Type
// -------------------

export const recordPartSchema: z.ZodType<RecordPart> = z.lazy(() =>
  z.union([
    z.intersection(
      recordSimpleValueSchema,
      z.object({
        parts: z.record(recordPartSchema).optional(),
      })
    ),
    z.intersection(
      recordValueByTypeSchema['list-with-parts'],
      z.object({
        'list-parts': z.record(recordPartSchema),
        parts: z.record(recordPartSchema).optional(),
      })
    ),
    z.intersection(
      recordValueByTypeSchema['repeat-list'],
      z.object({
        repeat: z.record(recordPartSchema),
      })
    ),
  ])
)
export const recordTypeSchema = z.object({
  'storage-version': z.literal('1.0.0').default('1.0.0'),
  sections: z.record(
    z.object({
      parts: z.record(recordPartSchema),
    })
  ),
})

export type RecordPart =
  | (RecordSimpleValue & {
      parts?: Record<string, RecordPart>
    })
  | (RecordValueByType['list-with-parts'] & {
      'list-parts': Record<string, RecordPart>
      parts?: Record<string, RecordPart>
    })
  | (RecordValueByType['repeat-list'] & {
      repeat: Record<string, RecordPart>
    })
export type RecordType = z.infer<typeof recordTypeSchema>

// -------------------
//   Flat Record Type
// -------------------

export type RecordValuePath = (string | number)[]

export const recordValueSchema = z.union([
  recordSimpleValueSchema,
  recordValueByTypeSchema['list-with-parts'],
  recordValueByTypeSchema['repeat-list'],
])

export const flatRecordSchema = z.record(recordValueSchema)

export type RecordValue = z.infer<typeof recordValueSchema>
export type FlatRecord = z.infer<typeof flatRecordSchema>
