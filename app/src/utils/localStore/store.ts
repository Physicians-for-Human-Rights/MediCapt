import {
  GetFormsFilters,
  getForm as getFormRequest,
  getFormVersion as getFormVersionRequest,
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
  recordMetadataSchema,
} from 'utils/types/recordMetadata'
import { schemaVersions } from 'api/utils'
import { Platform } from 'react-native'
import RNFetchBlob from 'utils/localStore/rnfetch'

export async function getFormMetadata(formUUID: string, localOnly?: boolean) {
  if (localOnly) throw Error('Form not found offline.')
  return getFormMetadataRequest(formUUID)
}

export async function getForm(formUUID: string, localOnly?: boolean) {
  if (localOnly) throw Error('Form not found offline.')
  return getFormRequest(formUUID)
}

export async function getFormVersion(
  formUUID: string,
  version: string,
  localOnly?: boolean
) {
  if (localOnly) throw Error('Form not found offline.')
  return getFormVersionRequest(formUUID, version)
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
    // NB This fails on Android because Blob has bugs in Expo when nested inside
    // a more complex FormData. Plain Blobs do work though. If you try to debug
    // this on Android, note that the debugger corrupts payloads.
    if (Platform.OS === 'web') {
      let record = new FormData()
      for (const field in e.link.fields) {
        record.append(field, e.link.fields[field])
      }
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
      try {
        await fetch(e.link.url, {
          method: 'POST',
          headers: new Headers({
            AcceptedVersions: JSON.stringify(
              schemaVersions(recordMetadataSchema)
            ),
          }),
          body: record,
        })
      } catch (err) {
        console.error(
          'Failed to upload',
          recordMetadata,
          recordManifest,
          e,
          err
        )
        throw Error(`Failed to upload ${e} \n ${err}`)
      }
    } else {
      let record = []
      for (const field in e.link.fields) {
        record.push({ name: field, data: e.link.fields[field] })
      }
      function b64EncodeUnicode(str) {
        return btoa(
          encodeURIComponent(str).replace(
            /%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
              return String.fromCharCode('0x' + p1)
            }
          )
        )
      }
      const data =
        e.filename === 'manifest' && e.filetype === 'manifest'
          ? b64EncodeUnicode(recordManifestString)
          : filetypeIsDataURI(e.filetype)
          ? lookupManifestSHA256(recordManifest, e.sha256)!.data.split(',')[1]
          : b64EncodeUnicode(
              lookupManifestSHA256(recordManifest, e.sha256)!.data
            )
      record.push({
        filename: e.filename,
        name: 'file',
        data: data,
      })
      try {
        await RNFetchBlob.fetch('POST', e.link.url, {}, record)
      } catch (err) {
        console.error(
          'Failed to upload',
          // recordMetadata,
          // recordManifest,
          e,
          err
        )
        throw Error(`Failed to upload ${e} \n ${err}`)
      }
    }
  }

  // Upload is finished, commit
  const commitedRecordMetadata = await commitRecordRequest(
    updatedRecordMetadata.recordUUID,
    updatedRecordMetadata
  )

  return commitedRecordMetadata
}

export async function sealRecord(
  recordMetadata: RecordMetadata,
  localOnly?: boolean
) {
  if (localOnly) throw Error('Cannot seal record while offline.')
  return sealRecordRequest(recordMetadata)
}
