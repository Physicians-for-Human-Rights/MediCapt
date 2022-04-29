import { z } from 'zod'
import { dateSchema } from './common'

export type RecordValuePath = (string | number)[]

export const recordValueSchema = z.lazy(() =>
  z.intersection(
    skippableSchema,
    z.union([
      recordSimpleValueSchema,
      recordValueTypesSchema['list-with-parts'],
      recordValueTypesSchema['repeat-list'],
    ])
  )
)
export const flatRecordSchema = z.record(recordValueSchema)
export type RecordValue = z.infer<typeof recordValueSchema>
export type FlatRecord = z.infer<typeof flatRecordSchema>

export const recordTypeSchema = z.lazy(() =>
  z.object({
    'storage-version': z.literal('1.0.0').default('1.0.0'),
    sections: z.record(
      z.object({
        parts: z.record(recordPartSchema),
      })
    ),
  })
)
export const recordPartSchema: z.ZodType<RecordPart> = z.lazy(() =>
  z.intersection(
    skippableSchema,
    z.union([
      z.intersection(
        recordSimpleValueSchema,
        z.object({
          parts: z.record(recordPartSchema).optional(),
        })
      ),
      z.intersection(
        recordValueTypesSchema['list-with-parts'],
        z.object({
          'list-parts': z.record(recordPartSchema),
          parts: z.record(recordPartSchema).optional(),
        })
      ),
      z.intersection(
        recordValueTypesSchema['repeat-list'],
        z.object({
          repeat: z.record(recordPartSchema),
        })
      ),
    ])
  )
)
export const skippableSchema = z.object({
  skipped: z.boolean().optional(),
})
export const recordSimpleValueSchema = z.lazy(() =>
  z.union([
    recordValueTypesSchema['untyped'],
    recordValueTypesSchema['bool'],
    recordValueTypesSchema['number'],
    recordValueTypesSchema['text'],
    recordValueTypesSchema['long-text'],
    recordValueTypesSchema['email'],
    recordValueTypesSchema['address'],
    recordValueTypesSchema['phone-number'],
    recordValueTypesSchema['gender'],
    recordValueTypesSchema['sex'],
    recordValueTypesSchema['date'],
    recordValueTypesSchema['date-time'],
    recordValueTypesSchema['signature'],
    recordValueTypesSchema['photo'],
    recordValueTypesSchema['body-image'],
    recordValueTypesSchema['list'],
    recordValueTypesSchema['list-with-labels'],
    recordValueTypesSchema['list-multiple'],
    recordValueTypesSchema['list-with-labels-multiple'],
  ])
)
export const recordValueTypesSchema = {
  untyped: z.object({
    type: z.undefined().optional(),
  }),
  bool: z.object({
    type: z.literal('bool'),
    value: z.boolean(),
  }),
  number: z.object({
    type: z.literal('number'),
    value: z.string(),
  }),
  text: z.object({
    type: z.literal('text'),
    value: z.string(),
  }),
  'long-text': z.object({
    type: z.literal('long-text'),
    value: z.string(),
  }),
  email: z.object({
    type: z.literal('email'),
    value: z.string().email().nonempty(),
  }),
  address: z.object({
    type: z.literal('address'),
    value: z.string().nonempty(),
  }),
  'phone-number': z.object({
    type: z.literal('phone-number'),
    value: z.string().nonempty(),
  }),
  gender: z.object({
    type: z.literal('gender'),
    value: z.string().nonempty(),
  }),
  sex: z.object({
    type: z.literal('sex'),
    value: z.string(), // z.enum(['male', 'female', 'intersex']),
  }),
  date: z.object({
    type: z.literal('date'),
    value: dateSchema,
  }),
  'date-time': z.object({
    type: z.literal('date-time'),
    value: dateSchema,
  }),
  signature: z.object({
    type: z.literal('signature'),
    value: z.string().nonempty(),
    signer: z.string().optional(),
    'date-signed': dateSchema.optional(),
  }),
  photo: z.object({
    type: z.literal('photo'),
    value: z.lazy(() => recordPhotoSchema.array()),
  }),
  'body-image': z.object({
    type: z.literal('body-image'),
    value: z.object({
      uri: z.string(),
      annotations: z.lazy(() => imageAnnotationSchema.array()),
    }),
  }),
  list: z.object({
    type: z.literal('list'),
    value: z.object({
      options: z
        .union([z.string().array(), z.number().array(), z.boolean().array()])
        .nullable(),
      selection: z.string().nullable(),
      otherValue: z.string().nullable(),
    }),
  }),
  'list-with-labels': z.object({
    type: z.literal('list-with-labels'),
    value: z.object({
      options: z
        .object({
          key: z.string().nonempty(),
          value: z.union([z.string(), z.number(), z.boolean()]),
        })
        .array()
        .nullable(),
      selection: z.string().nullable(),
      otherValue: z.string().nullable(),
    }),
  }),
  'list-multiple': z.object({
    type: z.literal('list-multiple'),
    value: z.object({
      options: z.union([
        z.string().array(),
        z.number().array(),
        z.boolean().array(),
      ]),
      selections: z.boolean().array(),
      otherChecked: z.boolean().optional(),
      otherValue: z.string().optional(),
    }),
  }),
  'list-with-labels-multiple': z.object({
    type: z.literal('list-with-labels-multiple'),
    value: z.string(),
  }),
  'list-with-parts': z.object({
    type: z.literal('list-with-parts'),
    value: z.string(),
  }),
  'repeat-list': z.object({
    type: z.literal('repeat-list'),
    value: z.string().array(),
  }),
}
const RecordValueByType = z.object(recordValueTypesSchema)
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
export type RecordType = z.infer<typeof recordTypeSchema>
export type RecordPart = Skippable &
  (
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
  )
export type Skippable = z.infer<typeof skippableSchema>
export type RecordSimpleValue = z.infer<typeof recordSimpleValueSchema>
export type RecordValueByType = z.infer<typeof RecordValueByType>
export type RecordPhoto = z.infer<typeof recordPhotoSchema>
export type ImageAnnotation = z.infer<typeof imageAnnotationSchema>

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
