import { z } from 'zod'
import { FormKVRawType, FormPart } from 'utils/types/form'
import { dateSchema } from './common'

export type RecordValuePath = (string | number)[]

export type RecordValue =
  | RecordSimpleValue
  | RecordValueByType['repeat-list']
  | RecordValueByType['list-with-parts']
export type FlatRecord = Record<string, RecordValue>

export const recordTypeSchema = z.lazy(() =>
  z.object({
    'storage-version': z.literal('1.0.0').default('1.0.0'),
    sections: z.record(
      z.object({
        parts: z.record(skippableRecordPartSchema),
      })
    ),
  })
)

export const skippableRecordPartSchema = z.lazy(() =>
  z.intersection(
    recordPartSchema,
    z.object({
      skipped: z.boolean().optional(),
    })
  )
)

export const recordPartSchema = z.lazy(() =>
  z.union([
    recordValueTypesSchema['repeat-list'],
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
    recordValueTypesSchema['singature'],
    recordValueTypesSchema['photo'],
    recordValueTypesSchema['body-image'],
    recordValueTypesSchema['list'],
    recordValueTypesSchema['list-with-labels'],
    recordValueTypesSchema['list-multiple'],
    recordValueTypesSchema['list-with-labels-multiple'],
    recordValueTypesSchema['list-with-parts'],
  ])
)

export const recordValueTypesSchema = {
  'repeat-list': z.object({
    type: z.literal('repeat-list'),
    value: z.string().array(),
  }),
  bool: z.object({
    type: z.literal('bool'),
    value: z.boolean(),
  }),
  number: z.object({
    type: z.literal('number'),
    value: z.number(),
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
    value: z.enum(['male', 'female', 'intersex']),
  }),
  date: z.object({
    type: z.literal('date'),
    value: dateSchema,
  }),
  'date-time': z.object({
    type: z.literal('date-time'),
    value: dateSchema,
  }),
  singature: z.object({
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
      options: z.object({
        key: z.string().nonempty(),
        value: z.union([z.string(), z.number(), z.boolean()]).nullable(),
      }),
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
}

const recordPhotoSchema = z.object({
  uri: z.string().nonempty(),
  'date-taken': dateSchema.optional(),
})

const imageAnnotationSchema = z.object({
  location: z.object({
    x: z.number().int().min(0).max(10000),
    y: z.number().int().min(0).max(10000),
  }),
  text: z.string(),
  photos: recordPhotoSchema.array(),
})

export type RecordType = {
  'storage-version'?: '1.0.0'
  sections: RecordSections
}

export type RecordSections = {
  [sectionName: string]: RecordSection
}

export type RecordSection = {
  parts: RecordParts
}

export type RecordParts = {
  [partName: string]: RecordRepeatedPart | RecordPart
}

export type RecordRepeatedPart = RecordValueByType['repeat-list'] & {
  repeat: RecordParts
}

export type RecordPart = {
  parts?: RecordParts
} & (RecordSimpleValue | RecordListWithParts)

export type RecordListWithParts = RecordValueByType['list-with-parts'] & {
  'list-parts': RecordParts
}

export type RecordSimpleValue =
  | RecordValueByType['bool']
  | RecordValueByType['date']
  | RecordValueByType['date-time']
  | RecordValueByType['number']
  | RecordValueByType['list']
  | RecordValueByType['list-with-labels']
  | RecordValueByType['list-multiple']
  | RecordValueByType['list-with-labels-multiple']
  | RecordValueByType['text']
  | RecordValueByType['long-text']
  | RecordValueByType['email']
  | RecordValueByType['address']
  | RecordValueByType['phone-number']
  | RecordValueByType['gender']
  | RecordValueByType['sex']
  | RecordValueByType['signature']
  | RecordValueByType['photo']
  | RecordValueByType['body-image']

export type RecordValueByType = {
  'repeat-list': {
    type?: 'repeat-list'
    skipped?: boolean
    value?: string[]
  }
  bool: {
    type?: 'bool'
    skipped?: boolean
    value?: boolean
  }
  number: {
    type?: 'number'
    skipped?: boolean
    value?: string
  }
  text: {
    type?: 'text'
    skipped?: boolean
    value?: string
  }
  'long-text': {
    type?: 'long-text'
    skipped?: boolean
    value?: string
  }
  email: {
    /**
           @faker internet.email
    */
    type?: 'email'
    skipped?: boolean
    value?: string
  }
  address: {
    type?: 'address'
    skipped?: boolean
    value?: string
  }
  'phone-number': {
    type?: 'phone-number'
    skipped?: boolean
    value?: string
  }
  gender: {
    type?: 'gender'
    skipped?: boolean
    value?: string
  }
  sex: {
    type?: 'sex'
    skipped?: boolean
    value?: string // TODO 'male' | 'female' | 'intersex'
  }
  date: {
    type?: 'date'
    skipped?: boolean
    value?: Date
    birthdate?: boolean
  }
  'date-time': {
    /**
     @format date-time
    */
    type?: 'date-time'
    skipped?: boolean
    value?: Date
  }
  list: {
    type?: 'list'
    skipped?: boolean
    value?: {
      options: string[] | boolean[] | number[] | null
      // selection: number | 'other'
      // otherText?: string
      selection: string | null
      otherValue: string | null
    }
  }
  'list-with-labels': {
    type?: 'list-with-labels'
    skipped?: boolean
    value?: {
      options: FormKVRawType[] | null
      // selection: number | 'other'
      // otherText?: string
      selection: string | null
      otherValue: string | null
    }
  }
  'list-multiple': {
    type?: 'list-multiple'
    skipped?: boolean
    value?: {
      options: string[] | boolean[] | number[]
      selections: boolean[]
      otherChecked?: boolean
      otherValue?: string
    }
  }
  'list-with-labels-multiple': {
    type?: 'list-with-labels-multiple'
    skipped?: boolean
    value?: {
      options: FormKVRawType[]
      selections: boolean[]
      other?: string
    }
  }
  'list-with-parts': {
    type?: 'list-with-parts'
    skipped?: boolean
    value?: {
      options: FormPart[]
      selections: boolean[]
    }
  }
  signature: {
    type: 'signature'
    skipped?: boolean
    /**
     @format uri
    */
    value?: string
    signer?: string
    'date-signed'?: Date
  }
  photo: {
    type?: 'photo'
    skipped?: boolean
    value?: RecordPhoto[]
  }
  'body-image': {
    /**
       @format uri
    */
    type?: 'body-image'
    skipped?: boolean
    value?: {
      uri: string
      annotations: ImageAnnotation[]
    }
  }
}

export type RecordPhoto = {
  /**
     @format uri
  */
  uri: string
  /**
     @format date-time
  */
  'date-taken': Date
}

export type ImageAnnotation = {
  location: {
    /**
      @minimum 0
      @maximum 10000
      @type integer
    */
    x: number
    /**
      @minimum 0
      @maximum 10000
      @type integer
    */
    y: number
  }
  text: string
  photos: RecordPhoto[]
}

export const RecordMetadata = z
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

export type RecordMetadata = z.infer<typeof RecordMetadata>
