export type RecordType = {
  'storage-version'?: '1.0.0'
  sections: RecordSections
}

export type RecordSections = {
  [path: string]: RecordData[]
}

export type RecordPath = (string | number)[]

export type RecordData = RecordDataContents & {
  /**
   * @pattern ^[a-zA-Z_-]+$
   */
  path: string
  parts?: RecordDataByType['part'][]
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

export type RecordDataByType = {
  part: {
    /**
     * @pattern ^[a-zA-Z_-]+$
     */
    name: string
    part: RecordData
  }
  bool: {
    bool: boolean
  }
  signature: {
    signer?: string
    /**
       @format uri
    */
    uri: string
    /**
       @format date-time
    */
    'date-signed': Date
  }
  date: {
    birthdate?: boolean
    /**
       @format date
    */
    date: Date
  }
  'date-time': {
    /**
       @format date-time
    */
    date: Date
  }
  number: {
    number: number
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
    selections: string[]
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
    /**
       @pattern ^\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$
      */
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

export type RecordDataMaybeRepeated<T extends keyof RecordDataByType> =
  | ({
      type: T
      repeated?: false | null
    } & RecordDataByType[T])
  | { type: T; repeated: RecordDataByType[T][] }

export type RecordDataContents =
  | RecordDataMaybeRepeated<'part'>
  | RecordDataMaybeRepeated<'bool'>
  | RecordDataMaybeRepeated<'signature'>
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

// export type RecordDataContents =
//   | ({
//       type: 'part'
//       repeated?: false | null
//     } & RecordDataByType['part'])
//   | {
//       type: 'part'
//       repeated: RecordDataByType['part'][]
//     }
//   | {
//       type: 'bool'
//       bool: boolean | null
//     }
//   | {
//       type: 'signature'
//       signer: string | null
//       dataURI: string
//       'date-signed': Date | null
//     }
//   | {
//       type: 'date'
//       birthdate: boolean | null
//       date: Date
//     }
//   | {
//       type: 'number'
//       number: number | null
//     }
//   | {
//       type: 'list'
//       'select-multiple': false
//       selection: string | null
//       other: string | null
//     }
//   | {
//       type: 'list-with-labels'
//       'select-multiple': false
//       selection: string | null
//       other: string | null
//     }
//   | {
//       type: 'list'
//       'select-multiple': true
//       selections: string[] | null
//       other: string | null
//     }
//   | {
//       type: 'list-with-labels'
//       'select-multiple': true
//       selections: string[] | null
//       other: string | null
//     }
//   | {
//       type: 'text'
//       value: string | null
//     }
//   | {
//       type: 'long-text'
//       value: string | null
//     }
//   | {
//       type: 'address'
//       value: string | null
//     }
//   | {
//       type: 'phone-number'
//       value: string | null
//     }
//   | {
//       type: 'gender'
//       value: string | null
//     }
//   | {
//       type: 'sex'
//       value: string | null
//     }
//   | {
//       type: 'photo'
//       // TODO Change this to be a pointer to a file instead of a URI
//       data: { dataURI: string; 'date-taken': Date } | null
//     }
//   | {
//       type: 'body-image'
//       data: string
//       annotations: {
//         location: { x: number; y: number }
//         data: string
//       }[]
//     }

// export type RecordDataContents =
//   | {
//       type: 'part'
//       name: string
//       part: RecordData | null
//       repeated?: (RecordDataContents & { type: 'part' })[]
//     }
//   | {
//       type: 'bool'
//       bool: boolean | null
//       repeated?: (RecordDataContents & { type: 'bool' })[]
//     }
//   | {
//       type: 'signature'
//       signer: string | null
//       dataURI: string
//       'date-signed': Date | null
//       repeated?: (RecordDataContents & { type: 'signature' })[]
//     }
//   | {
//       type: 'date'
//       birthdate: boolean | null
//       date: Date
//       repeated?: (RecordDataContents & { type: 'date' })[]
//     }
//   | {
//       type: 'number'
//       number: number | null
//       repeated?: (RecordDataContents & { type: 'number' })[]
//     }
//   | {
//       type: 'list'
//       'select-multiple': false
//       selection: string | null
//       other: string | null
//       repeated?: (RecordDataContents & {
//         type: 'list'
//         'select-multiple': false
//       })[]
//     }
//   | {
//       type: 'list-with-labels'
//       'select-multiple': false
//       selection: string | null
//       other: string | null
//       repeated?: (RecordDataContents & {
//         type: 'list-with-labels'
//         'select-multiple': false
//       })[]
//     }
//   | {
//       type: 'list'
//       'select-multiple': true
//       selections: string[] | null
//       other: string | null
//       repeated?: (RecordDataContents & {
//         type: 'list'
//         'select-multiple': true
//       })[]
//     }
//   | {
//       type: 'list-with-labels'
//       'select-multiple': true
//       selections: string[] | null
//       other: string | null
//       repeated?: (RecordDataContents & {
//         type: 'list-with-labels'
//         'select-multiple': true
//       })[]
//     }
//   | {
//       type: 'text'
//       value: string | null
//       repeated?: (RecordDataContents & { type: 'text' })[]
//     }
//   | {
//       type: 'long-text'
//       value: string | null
//       repeated?: (RecordDataContents & { type: 'long-text' })[]
//     }
//   | {
//       type: 'address'
//       value: string | null
//       repeated?: (RecordDataContents & { type: 'address' })[]
//     }
//   | {
//       type: 'phone-number'
//       value: string | null
//       repeated?: (RecordDataContents & { type: 'phone-number' })[]
//     }
//   | {
//       type: 'gender'
//       value: string | null
//       repeated?: (RecordDataContents & { type: 'gender' })[]
//     }
//   | {
//       type: 'sex'
//       value: string | null
//       repeated?: (RecordDataContents & { type: 'sex' })[]
//     }
//   | {
//       type: 'photo'
//       // TODO Change this to be a pointer to a file instead of a URI
//       data: { dataURI: string; 'date-taken': Date } | null
//       repeated?: (RecordDataContents & { type: 'photo' })[]
//     }
//   | {
//       type: 'body-image'
//       data: string
//       annotations: {
//         location: { x: number; y: number }
//         data: string
//       }[]
//       repeated?: (RecordDataContents & { type: 'body-image' })[]
//     }

export type RecordDataMap = {
  [path: string]: RecordValue | RecordData
}

export type RecordMetadata = {
  recordUUID: string
  recordID: string
  locationUUID: string
  createdDate: Date
  providerCreatedUUID: string
  formUUID: string
  formName: string
  formTags: string
  formVersion: string
  completed: boolean
  completedDate: Date | null
  providerCompletedUUID: string
  lastChangedDate: Date
  providerLastChangedUUID: string
  patientName: string
  patientGender: string
  patientAge: string
  patientUUID: string
  caseId: string
  recordStorageVersion: '1.0.0'
}

export type RecordValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | Date
