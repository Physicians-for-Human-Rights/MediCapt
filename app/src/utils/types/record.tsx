import { z } from 'zod'
import { FormKVRawType, FormPart } from 'utils/types/form'

export type RecordValuePath = (string | number)[]

export type RecordValue =
  | RecordSimpleValue
  | RecordValueByType['repeat-list']
  | RecordValueByType['list-with-parts']
export type FlatRecord = Record<string, RecordValue>

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

// TODO Integrate this back in
// export type RecordDataMap = {
//   [path: string]: RecordValue | RecordData
// }

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

export type RecordValueTypes =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | Date
