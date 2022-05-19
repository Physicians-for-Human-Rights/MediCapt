import { Platform } from 'react-native'
import * as FileSystem from 'expo-file-system'
import _ from 'lodash'
import { Asset } from 'expo-asset'
import {
  FormValueType,
  FormPart,
  FormSectionMap,
  FormPartMap,
  FormDefinition,
  FormRef,
  FormSection,
} from 'utils/types/form'
import { NamedFormSection, FormFns } from 'utils/types/formHelpers'
import { RecordPath } from 'utils/types/record'
import CryptoJS from 'crypto-js'
import { unDataURI } from 'utils/data'
import {
  FormMetadata,
  FormFileWitDataSchema,
  FormManifestWithData,
} from 'utils/types/formMetadata'
import { blobToBase64 } from 'utils/data'

export type ManifestContentsFile = {
  data: string
  sha256: string
  md5: string
  filename: string
  filetype: string
}

export type ManifestContents = ManifestContentsFile[]
export function lookupContentsByNameAndType(
  contents: ManifestContents,
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
): FormFileWitDataSchema {
  return {
    data,
    filename,
    filetype,
    sha256: sha256(isDataURI ? unDataURI(data) : data),
    md5: md5(isDataURI ? unDataURI(data) : data),
  }
}

export function addFileToManifest(
  manifest: FormManifestWithData,
  data: string,
  filename: string,
  filetype: string,
  isDataURI: boolean
): FormManifestWithData {
  return {
    ...manifest,
    contents: _.concat(manifest.contents, [
      makeManifestEntry(data, filename, filetype, isDataURI),
    ]),
  }
}

export function mapManifest(
  manifest: FormManifestWithData,
  fn: (f: FormFileWitDataSchema) => FormFileWitDataSchema
): FormManifestWithData {
  return {
    ...manifest,
    contents: _.map(manifest.contents, fn),
  }
}

export function changeFilenameInManifest(
  manifest: FormManifestWithData,
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
  manifest: FormManifestWithData,
  fn: (f: FormFileWitDataSchema) => boolean
): FormManifestWithData {
  return {
    ...manifest,
    contents: _.filter(manifest.contents, fn),
  }
}

export function isInManifest(
  manifest: FormManifestWithData,
  fn: (f: FormFileWitDataSchema) => boolean
): boolean {
  return !!_.find(manifest.contents, fn)
}

export function lookupManifestSHA256(
  manifest: FormManifestWithData,
  sha256: string
) {
  return _.find(manifest.contents, e => e.sha256 === sha256)
}

export function isInManifestByNameAndType(
  manifest: FormManifestWithData,
  filename: string,
  filetype: string
): boolean {
  return !!_.find(
    manifest.contents,
    e => e.filename === filename && e.filetype === filetype
  )
}

export function lookupManifestByNameAndType(
  manifest: FormManifestWithData,
  filename: string,
  filetype: string
) {
  return _.find(
    manifest.contents,
    e => e.filename === filename && e.filetype === filetype
  )
}

export function lookupManifest(
  manifest: FormManifestWithData,
  fn: (f: FormFileWitDataSchema) => boolean
) {
  return _.find(manifest.contents, e => fn(e))
}

export function isImage(f: FormFileWitDataSchema) {
  return (
    f.filetype === 'image/webp' ||
    f.filetype === 'image/png' ||
    f.filetype === 'image/jpeg'
  )
}

export function addOrReplaceFileToManifestByFilename(
  manifest: FormManifestWithData,
  data: string,
  filename: string,
  filetype: string,
  isDataURI: boolean
): FormManifestWithData {
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

export function filetypeIsDataURI(filetype: string) {
  return filetype === 'application/pdf' || filetype.startsWith('image/')
}

export async function fetchManifestContents(
  contents: {
    sha256: string
    filetype: string
    link: string
    filename: string
  }[]
) {
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
