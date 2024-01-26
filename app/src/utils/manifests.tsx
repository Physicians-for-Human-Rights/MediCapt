import _ from 'lodash'
import CryptoJS from 'crypto-js'
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
  FormMetadata,
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
import { ZodError } from 'zod'
import JSZip from 'jszip'
import { dataURItoBlob, isBinary, unDataURI } from 'utils/data'

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
    e => e.filename === filename && _.startsWith(e.filetype, filetype)
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

export function md5(data: string, isBinary: boolean): string {
  return CryptoJS.enc.Base64.stringify(
    CryptoJS.MD5(
      (isBinary ? CryptoJS.enc.Latin1.parse : CryptoJS.enc.Utf8.parse)(data)
    )
  )
}

export function sha256(data: string, isBinary: boolean): string {
  return CryptoJS.enc.Base64.stringify(
    CryptoJS.SHA256(
      (isBinary ? CryptoJS.enc.Latin1.parse : CryptoJS.enc.Utf8.parse)(data)
    )
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
  const rawData = isDataURI ? unDataURI(data) : data
  return {
    data,
    filename,
    filetype,
    sha256: sha256(rawData, isBinary(filetype)),
    md5: md5(rawData, isBinary(filetype)),
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

export function imageExtension(filetype: string) {
  if (filetype === 'image/webp') return 'webp'
  if (filetype === 'image/png') return 'png'
  if (filetype === 'image/jpeg') return 'jpg'
  throw Error('Unknown image extension for filetype ' + filetype)
}

export function fileExtension(filetype: string) {
  if (filetype === 'image/webp') return 'webp'
  if (filetype === 'image/png') return 'png'
  if (filetype === 'image/jpeg') return 'jpg'
  if (filetype === 'text/yaml') return 'yaml'
  if (filetype === 'text/json') return 'json'
  if (filetype === 'application/pdf') return 'pdf'
  if (filetype === 'manifest') return 'json'
  if (filetype === 'metadata') return 'json'
  throw Error('Unknown file extension for filetype ' + filetype)
}

export function filetypeToMimetype(filetype: string) {
  if (filetype == 'manifest') return 'application/json'
  return filetype
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
): RecordType | ZodError | null {
  const recordFile = lookupManifest(
    recordManifest,
    e => e.filetype === 'text/json' && e.filename === 'record.json'
  )
  if (recordFile) {
    try {
      return recordTypeSchema.parse(JSON.parse(recordFile.data))
    } catch (err) {
      if (err instanceof ZodError) {
        return err
      }
      throw err
    }
  } else return null
}

export function getFormTypeFromManifest(
  formManifest: FormManifestWithData
): FormType | null {
  const formFile = lookupManifest(
    formManifest,
    e => e.filetype === 'text/yaml' && e.filename === 'form.yaml'
  )
  if (formFile) {
    console.log('formFile', formFile)
    return yaml.load(formFile.data) as FormType
  }
  return null
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
            response.blob
              ? new Blob([await response.blob()], { type: e.filetype })
              : // NB This appears only on android, no idea why
                new Blob([await response.text()], { type: e.filetype })
          )
        : await response.text()
      return {
        sha256: e.sha256,
        md5: md5(data, isBinary(e.filetype)),
        filename: e.filename,
        data: data,
        filetype: e.filetype,
      }
    })
  )
}

export function generateZip(
  formMetadata: Partial<FormMetadata>,
  manifest: FormManifestWithData
) {
  const zip = new JSZip()
  zip.file('metadata.json', JSON.stringify(formMetadata))
  const m: FormManifest = {
    'storage-version': manifest['storage-version'],
    contents: _.map(manifest.contents, f =>
      _.pick(f, ['sha256', 'filetype', 'filename'])
    ),
    root: manifest.root,
  }
  zip.file('manifest.json', JSON.stringify(manifest))
  for (const f of manifest.contents) {
    zip.file(
      _.includes(f.filename, '.')
        ? f.filename
        : f.filename + '.' + fileExtension(f.filetype),
      isBinary(f.filetype) ? dataURItoBlob(f.data) : f.data
    )
  }
  zip.generateAsync({ type: 'blob' }).then(function (content) {
    var url = window.URL.createObjectURL(content)
    const tempLink = document.createElement('a')
    tempLink.href = url
    tempLink.setAttribute(
      'download',
      (formMetadata.formID && formMetadata.version
        ? formMetadata.formID + '_' + formMetadata.version
        : 'form') + '.zip'
    )
    tempLink.click()
  })
}
