export type RecordType = {
  data: RecordData
  'storage-version'?: '1.0.0'
}

export type RecordData = {
  [path: string]: RecordValue
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
