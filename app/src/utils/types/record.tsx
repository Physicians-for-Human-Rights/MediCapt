import { z } from 'zod'

export type RecordType = {
  'storage-version'?: '1.0.0'
  sections: RecordSections
}

export type RecordSections = {
  [path: string]: RecordSubparts
}

export type RecordSubparts = {
  parts: RecordParts
}

export type RecordParts = {
  [path: string]: RecordDataContents
}

export type RecordPath = (string | number)[]

// TODO Bring this back and test it
// export type RecordData = RecordDataContents & {
//   /**
//    * @pattern ^[a-zA-Z_-]+$
//    */
//   path: string
//   parts?: RecordDataByType['part'][]
// }

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

export type RecordDataByType =
  // TODO Bring this back and test it
  // part: {
  //   /**
  //    * @pattern ^[a-zA-Z_-]+$
  //    */
  //   name: string
  //   part: RecordData
  // }
  {
    bool: {
      value: boolean
    }
    signature: {
      signer?: string
      /**
       @format uri
    */
      uri: string
      'date-signed': Date
    }
    date: {
      birthdate?: boolean
      value: Date
    }
    'date-time': {
      /**
     @format date-time
  */
      value: Date
    }
    number: {
      value: string
    }
    list: {
      selection: string
      other?: string
    }
    'list-with-labels': {
      selection: string
      other?: string
    }
    'list-multiple': {
      value: (boolean | null)[]
      other?: string
    }
    'list-with-labels-multiple': {
      selections: string[]
      other?: string
    }
    text: {
      value: string
    }
    'long-text': {
      value: string
    }
    email: {
      /**
           @faker internet.email
        */
      value: string
    }
    address: {
      value: string
    }
    'phone-number': {
      value: string
    }
    gender: {
      value: string
    }
    sex: {
      value: string
    }
    photo: {
      value: RecordPhoto[]
    }
    'body-image': {
      /**
       @format uri
    */
      uri: string
      annotations: {
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
      }[]
    }
  }

// export type RecordDataMaybeRepeated<T extends keyof RecordDataByType> =
export type RecordDataMaybeRepeated<T extends keyof RecordDataByType> =
  | {
      [T: string]: RecordDataByType[T]
    }
  | { [T: string]: RecordDataByType[T][] }

export type RecordDataContents =
  // | RecordDataMaybeRepeated<'part'>
  | RecordDataMaybeRepeated<'bool'>
  | RecordDataMaybeRepeated<'signature'>
  | RecordDataMaybeRepeated<'date'>
  | RecordDataMaybeRepeated<'date'>
  | RecordDataMaybeRepeated<'number'>
  | RecordDataMaybeRepeated<'list-multiple'>
  | RecordDataMaybeRepeated<'list-with-labels-multiple'>
  | RecordDataMaybeRepeated<'list'>
  | RecordDataMaybeRepeated<'list-with-labels'>
  | RecordDataMaybeRepeated<'text'>
  | RecordDataMaybeRepeated<'address'>
  | RecordDataMaybeRepeated<'phone-number'>
  | RecordDataMaybeRepeated<'gender'>
  | RecordDataMaybeRepeated<'sex'>
  | RecordDataMaybeRepeated<'photo'>
  | RecordDataMaybeRepeated<'body-image'>

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

export type RecordValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | Date
