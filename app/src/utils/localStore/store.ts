import {
  GetFormsFilters,
  getForm as getFormRequest,
  getFormMetadata as getFormMetadataRequest,
  getForms as getFormsRequest,
  GetRecordsFilters,
  getRecords as getRecordsRequest,
  getRecordMetadata as getRecordMetadataRequest,
  getRecord as getRecordRequest,
  createRecord as createRecordRequest,
  updateRecord as updateRecordRequest,
  commitRecord as commitRecordRequest,
  sealRecord as sealRecordRequest,
} from 'api/provider'
import _ from 'lodash'
import { dataURItoBlob } from 'utils/data'
import {
  fetchManifestContents,
  filetypeIsDataURI,
  lookupManifestSHA256,
  md5,
  sha256,
  filetypeToMimetype,
} from 'utils/manifests'
import {
  FormManifestFileWithLink,
  FormMetadata,
} from 'utils/types/formMetadata'
import {
  RecordManifestFileWithLink,
  recordManifestSchema,
  RecordManifestWithData,
  recordManifestWithMD5Schema,
  RecordMetadata,
  RecordMetadataByUser,
} from 'utils/types/recordMetadata'

export async function getFormMetadata(formUUID: string, localOnly?: boolean) {
  if (localOnly) throw Error('Form not found offline.')
  return getFormMetadataRequest(formUUID)
}

export async function getForm(formUUID: string, localOnly?: boolean) {
  if (localOnly) throw Error('Form not found offline.')
  return getFormRequest(formUUID)
}

export async function getForms(
  filters: GetFormsFilters,
  localOnly?: boolean
): Promise<[FormMetadata[], string | undefined]> {
  if (localOnly) return [[], undefined]
  return getFormsRequest(filters)
}

export async function getFormManifestContents(
  linkContents: FormManifestFileWithLink[],
  localOnly?: boolean
) {
  if (localOnly) return []
  return fetchManifestContents(linkContents)
}

export async function getRecordMetadata(
  recordUUID: string,
  localOnly?: boolean
) {
  if (localOnly) throw Error('Record not found offline.')
  return getRecordMetadataRequest(recordUUID)
}

export async function getRecord(recordUUID: string, localOnly?: boolean) {
  if (localOnly) throw Error('Record not found offline.')
  return getRecordRequest(recordUUID)
}

export async function getRecords(
  filters: GetRecordsFilters,
  localOnly?: boolean
): Promise<[RecordMetadata[], string | undefined]> {
  if (localOnly) return [[], undefined]
  return getRecordsRequest(filters)
}

export async function getRecordManifestContents(
  linkContents: RecordManifestFileWithLink[],
  localOnly?: boolean
) {
  if (localOnly) return []
  return fetchManifestContents(linkContents)
}

export async function createRecord(
  recordMetadata: RecordMetadataByUser,
  localOnly?: boolean
) {
  if (localOnly) throw Error('Error saving record offline.')
  return createRecordRequest(recordMetadata)
}

export async function updateRecord(
  recordMetadata: RecordMetadata,
  recordManifest: RecordManifestWithData
) {
  const recordManifestString = JSON.stringify(
    recordManifestSchema.strip().parse(recordManifest)
  )

  const updatedRecordMetadata = {
    ...recordMetadata,
    manifestHash: sha256(recordManifestString, false),
    manifestMD5: md5(recordManifestString, false),
  }

  const { manifest: updatedRecordManifestWithPostLinks } =
    await updateRecordRequest(
      updatedRecordMetadata,
      recordManifestWithMD5Schema.strip().parse(recordManifest)
    )

  // Upload the parts
  for (const e of updatedRecordManifestWithPostLinks.contents) {
    let record = new FormData()
    for (const field in e.link.fields) {
      record.append(field, e.link.fields[field])
    }
    // This is disabled intentionally, it is the blob version of the upload
    // code. I thought this is the better way, but it fails on android.
    if (0) {
      const blob =
        e.filename === 'manifest' && e.filetype === 'manifest'
          ? new Blob([recordManifestString], {
              type: 'text/plain',
            })
          : filetypeIsDataURI(e.filetype)
          ? dataURItoBlob(lookupManifestSHA256(recordManifest, e.sha256)!.data)
          : new Blob([lookupManifestSHA256(recordManifest, e.sha256)!.data], {
              type: e.filetype,
            })
      record.append('file', blob)
    } else {
      record.append(
        'file',
        e.filename === 'manifest' && e.filetype === 'manifest'
          ? recordManifestString
          : filetypeIsDataURI(e.filetype)
          ? lookupManifestSHA256(recordManifest, e.sha256)!.data
          : lookupManifestSHA256(recordManifest, e.sha256)!.data
      )
    }
    try {
      await fetch(e.link.url, {
        method: 'POST',
        headers: new Headers({}),
        body: record,
      })
    } catch (err) {
      console.error('Failed to upload', recordMetadata, recordManifest, e, err)
      throw Error(`Failed to upload ${e} \n ${err}`)
    }
  }

  // Upload is finished, commit
  const commitedRecordMetadata = await commitRecordRequest(
    updatedRecordMetadata.recordUUID,
    updatedRecordMetadata
  )

  return commitedRecordMetadata
}

export async function sealRecord(recordUUID: string, localOnly?: boolean) {
  if (localOnly) throw Error('Cannot seal record while offline.')
  return sealRecordRequest(recordUUID)
}
