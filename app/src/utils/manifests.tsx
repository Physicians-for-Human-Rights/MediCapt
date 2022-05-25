import _ from 'lodash'
import CryptoJS from 'crypto-js'
import { unDataURI } from 'utils/data'
import { blobToBase64 } from 'utils/data'
import {
  FormManifest,
  FormManifestFile,
  FormManifestFileWithData,
  FormManifestFileWithLink,
  FormManifestFileWithMD5,
  FormManifestFileWithPostLink,
  FormManifestWithData,
  FormManifestWithLinks,
  FormManifestWithMD5,
  FormManifestWithPostLinks,
} from './types/formMetadata'
import {
  RecordManifest,
  RecordManifestFile,
  RecordManifestFileWithData,
  RecordManifestFileWithLink,
  RecordManifestFileWithMD5,
  RecordManifestFileWithPostLink,
  RecordManifestWithData,
  RecordManifestWithLinks,
  RecordManifestWithMD5,
  RecordManifestWithPostLinks,
} from './types/recordMetadata'
import { RecordType, recordTypeSchema } from './types/record'
import yaml from 'js-yaml'
import { FormType } from './types/form'

export type Manifest = FormManifest | RecordManifest
export type ManifestWithMD5 = FormManifestWithMD5 | RecordManifestWithMD5
export type ManifestWithPostLinks =
  | FormManifestWithPostLinks
  | RecordManifestWithPostLinks
export type ManifestWithLinks = FormManifestWithLinks | RecordManifestWithLinks
export type ManifestWithData = FormManifestWithData | RecordManifestWithData

export type ManifestFile = FormManifestFile | RecordManifestFile
export type ManifestFileWithMD5 =
  | FormManifestFileWithMD5
  | RecordManifestFileWithMD5
export type ManifestFileWithPostLink =
  | FormManifestFileWithPostLink
  | RecordManifestFileWithPostLink
export type ManifestFileWithLink =
  | FormManifestFileWithLink
  | RecordManifestFileWithLink
export type ManifestFileWithData =
  | FormManifestFileWithData
  | RecordManifestFileWithData

export function lookupContentsByNameAndType(
  contents: ManifestFileWithData[],
  filename: string,
  filetype: string
) {
  const r = _.find(
    contents,
    e => e.filename === filename && e.filetype === filetype
  )
  if (r) return r.data
  return null
}

export function lookupContentsSHA256(
  contents: ManifestFileWithData[],
  sha256: string
) {
  return _.find(contents, e => e.sha256 === sha256)?.data
}

export function md5(data: string): string {
  return CryptoJS.enc.Base64.stringify(
    CryptoJS.MD5(CryptoJS.enc.Utf8.parse(data))
  )
}

export function sha256(data: string): string {
  return CryptoJS.enc.Base64.stringify(
    CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(data))
  )
}

// It's important to know if the input is a data URI or not. data URIs have an
// additional prefix which is stripped off before being sent to the backend. If
// we don't strip it off here too, we will compute the wrong hashes.  We
// intentionally don't autodetect this, to avoid potential bugs.

export function makeManifestEntry(
  data: string,
  filename: string,
  filetype: string,
  isDataURI: boolean
): ManifestFileWithData {
  return {
    data,
    filename,
    filetype,
    sha256: sha256(isDataURI ? unDataURI(data) : data),
    md5: md5(isDataURI ? unDataURI(data) : data),
  }
}

export function addFileToManifest(
  manifest: ManifestWithData,
  data: string,
  filename: string,
  filetype: string,
  isDataURI: boolean
): ManifestWithData {
  return {
    ...manifest,
    contents: _.concat(manifest.contents, [
      makeManifestEntry(data, filename, filetype, isDataURI),
    ]),
  }
}

export function removeFileFromManifestSHA256(
  manifest: ManifestWithData,
  sha256: string
): ManifestWithData {
  const index = _.findIndex(manifest.contents, e => e.sha256 === sha256)
  return {
    ...manifest,
    contents: _.filter(manifest.contents, (_, i) => i !== index),
  }
}

export function mapManifest(
  manifest: ManifestWithData,
  fn: (f: ManifestFileWithData) => ManifestFileWithData
): ManifestWithData {
  return {
    ...manifest,
    contents: _.map(manifest.contents, fn),
  }
}

export function changeFilenameInManifest(
  manifest: ManifestWithData,
  sha256: string,
  newFilename: string
) {
  return mapManifest(manifest, e => {
    if (e.sha256 === sha256) {
      return { ...e, filename: newFilename }
    }
    return e
  })
}

export function filterManifest(
  manifest: ManifestWithData,
  fn: (f: ManifestFileWithData) => boolean
): ManifestWithData {
  return {
    ...manifest,
    contents: _.filter(manifest.contents, fn),
  }
}

export function isInManifest(
  manifest: ManifestWithData,
  fn: (f: ManifestFileWithData) => boolean
): boolean {
  return !!_.find(manifest.contents, fn)
}

export function lookupManifestSHA256(
  manifest: ManifestWithData,
  sha256: string
) {
  return _.find(manifest.contents, e => e.sha256 === sha256)
}

export function isInManifestByNameAndType(
  manifest: ManifestWithData,
  filename: string,
  filetype: string
): boolean {
  return !!_.find(
    manifest.contents,
    e => e.filename === filename && e.filetype === filetype
  )
}

export function lookupManifestByNameAndType(
  manifest: ManifestWithData,
  filename: string,
  filetype: string
) {
  return _.find(
    manifest.contents,
    e => e.filename === filename && e.filetype === filetype
  )
}

export function lookupManifest(
  manifest: ManifestWithData,
  fn: (f: ManifestFileWithData) => boolean
) {
  return _.find(manifest.contents, e => fn(e))
}

export function isImage(f: ManifestFileWithData) {
  return (
    f.filetype === 'image/webp' ||
    f.filetype === 'image/png' ||
    f.filetype === 'image/jpeg'
  )
}

export function addOrReplaceFileToManifestByFilename(
  manifest: ManifestWithData,
  data: string,
  filename: string,
  filetype: string,
  isDataURI: boolean
): ManifestWithData {
  if (isInManifestByNameAndType(manifest, filename, filetype)) {
    return mapManifest(manifest, e => {
      if (e.filename === filename && e.filetype === filetype) {
        return makeManifestEntry(data, filename, filetype, isDataURI)
      }
      return e
    })
  } else {
    return addFileToManifest(manifest, data, filename, filetype, isDataURI)
  }
}

export function addOrReplaceRecordTypeInManifest(
  recordManifest: RecordManifestWithData,
  record: RecordType
): ManifestWithData {
  return addOrReplaceFileToManifestByFilename(
    recordManifest,
    JSON.stringify(record),
    'record.json',
    'text/json',
    false
  )
}

export function getRecordTypeFormManifest(
  recordManifest: RecordManifestWithData
): RecordType {
  const recordFile = lookupManifest(
    recordManifest,
    e => e.filetype === 'text/json' && e.filename === 'record.json'
  )
  if (recordFile) return recordTypeSchema.parse(JSON.parse(recordFile.data))
  else
    return recordTypeSchema.parse({
      'storage-version': '1.0.0',
      sections: {},
    })
}

export function getFormTypeFromManifest(
  formManifest: FormManifestWithData
): FormType {
  const formFile = lookupManifest(
    formManifest,
    e => e.filetype === 'text/yaml' && e.filename === 'form.yaml'
  )
  if (formFile) {
    return yaml.load(formFile.data) as FormType
  } else {
    return {} as FormType
  }
}

export function filetypeIsDataURI(filetype: string) {
  return filetype === 'application/pdf' || filetype.startsWith('image/')
}

export async function fetchManifestContents(
  contents: ManifestFileWithLink[]
): Promise<ManifestFileWithData[]> {
  return await Promise.all(
    _.map(contents, async e => {
      const response = await fetch(e.link)
      const data = filetypeIsDataURI(e.filetype)
        ? await blobToBase64(
            new Blob([await response.blob()], { type: e.filetype })
          )
        : await response.text()
      return {
        sha256: e.sha256,
        md5: md5(data),
        filename: e.filename,
        data: data,
        filetype: e.filetype,
      }
    })
  )
}
