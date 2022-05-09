import _ from 'lodash'
import { API } from 'aws-amplify'
import { LocationType, locationSchema } from 'utils/types/location'
import { UserType, userSchema } from 'utils/types/user'
import {
  formMetadataSchema,
  formManifestWithLinksSchema,
  FormMetadata,
  FormGetServer,
} from 'utils/types/formMetadata'
import {
  recordMetadataSchemaByUser,
  recordMetadataSchema,
  recordManifestWithLinksSchema,
  RecordMetadataByUser,
  RecordMetadata,
  recordManifestWithMD5Schema,
  RecordManifestWithMD5,
  RecordPostServer,
  RecordGetServer,
  recordManifestWithPostLinksSchema,
} from 'utils/types/recordMetadata'
import { QueryFilterForType } from 'utils/types/url'

// User

export async function getUser(
  poolId: string,
  username: string
): Promise<Partial<UserType>> {
  const data = await API.get(
    'provider',
    '/provider/user/byId/' + poolId + '/' + username,
    {}
  )
  return userSchema.parse(data)
}

// Location

export async function getLocation(locationUUID: string): Promise<LocationType> {
  const data = await API.get(
    'provider',
    '/provider/location/byId/' + locationUUID,
    {}
  )
  return locationSchema.parse(data)
}

// Forms

export async function getFormMetadata(formUUID: string): Promise<FormMetadata> {
  const data = await API.get(
    'provider',
    '/provider/form/metadataById/' + formUUID,
    {}
  )
  return formMetadataSchema.parse(data.metadata)
}

export async function getForm(formUUID: string): Promise<FormGetServer> {
  const data = await API.get('provider', '/provider/form/byId/' + formUUID, {})
  return {
    metadata: formMetadataSchema.parse(data.metadata),
    manifest: formManifestWithLinksSchema.parse(data.manifest),
  }
}

export async function findForms(
  pre: () => any,
  post: () => any,
  filterCountry: string | undefined,
  filterLanguage: string | undefined,
  filterLocationID: string | undefined,
  filterSearchType: string | undefined,
  filterText: string | undefined,
  handleErrors: (err: any) => any,
  setForms: (users: FormMetadata[]) => any,
  setNextKey: (key: string) => any
) {
  try {
    pre()
    let filters: QueryFilterForType<LocationType> = []
    if (filterCountry) filters.push({ country: { eq: filterCountry } })
    if (filterLanguage) filters.push({ language: { eq: filterLanguage } })
    if (filterLocationID) filters.push({ locationID: { eq: filterLocationID } })
    if (filterText) filters.push({ locationID: { eq: filterText } })
    //
    // NB Providers are only allowed to see forms which are enabled
    filters.push({ enabled: { eq: 'enabled' } })
    const data = await API.get('provider', '/provider/form', {
      queryStringParameters: {
        filter: JSON.stringify(filters),
      },
    })
    // @ts-ignore TODO
    setForms(_.map(data.items, formMetadataSchema.parse))
    setNextKey(data.nextKey)
  } catch (e) {
    handleErrors(e)
  } finally {
    post()
  }
}

// Records

export async function createRecord(
  record: RecordMetadataByUser
): Promise<RecordMetadata> {
  const data = await API.post('provider', '/provider/record', {
    body: recordMetadataSchemaByUser.strip().parse(record),
  })
  return recordMetadataSchema.parse(data)
}

export async function updateRecord(
  metadata: RecordMetadata,
  manifest: RecordManifestWithMD5
): Promise<RecordPostServer> {
  const data = await API.post(
    'provider',
    '/provider/record/byId/' + metadata.recordUUID,
    {
      body: {
        metadata: recordMetadataSchema.parse(metadata),
        manifest: recordManifestWithMD5Schema.parse(manifest),
      },
    }
  )
  return {
    metadata: recordMetadataSchema.parse(data.metadata),
    manifest: recordManifestWithPostLinksSchema.parse(data.manifest),
  }
}

export async function commitRecord(
  recordUUID: string,
  metadata: RecordMetadata
): Promise<RecordMetadata> {
  const data = await API.post(
    'provider',
    '/provider/record/commitById/' + recordUUID,
    {
      body: recordMetadataSchema.parse(metadata),
    }
  )
  return recordMetadataSchema.parse(data.record)
}

export async function getRecordMetadata(
  recordUUID: string
): Promise<RecordMetadata> {
  const data = await API.get(
    'provider',
    '/provider/record/metadataById/' + recordUUID,
    {}
  )
  return recordMetadataSchema.parse(data.metadata)
}

export async function getRecord(recordUUID: string): Promise<RecordGetServer> {
  const data = await API.get(
    'provider',
    '/provider/record/byId/' + recordUUID,
    {}
  )
  return {
    metadata: recordMetadataSchema.parse(data.metadata),
    manifest: recordManifestWithLinksSchema.parse(data.manifest),
  }
}

export async function findRecords(
  pre: () => any,
  post: () => any,
  filterCountry: string | undefined,
  filterLanguage: string | undefined,
  filterLocationID: string | undefined,
  filterEnabled: string | undefined,
  filterSearchType: string | undefined,
  filterText: string | undefined,
  handleErrors: (err: any) => any,
  setRecords: (users: RecordMetadata[]) => any,
  setNextKey: (key: string) => any
) {
  try {
    pre()
    let filters: QueryFilterForType<LocationType> = []
    if (filterCountry) filters.push({ country: { eq: filterCountry } })
    if (filterLanguage) filters.push({ language: { eq: filterLanguage } })
    if (filterLocationID) filters.push({ locationID: { eq: filterLocationID } })
    if (filterEnabled) filters.push({ enabled: { eq: filterEnabled } })
    if (filterText) filters.push({ locationID: { eq: filterText } })
    const data = await API.get('provider', '/provider/record', {
      queryStringParameters: {
        filter: JSON.stringify(filters),
      },
    })
    // @ts-ignore TODO
    setRecords(_.map(data.items, recordMetadataSchema.parse))
    setNextKey(data.nextKey)
  } catch (e) {
    handleErrors(e)
  } finally {
    post()
  }
}

export async function sealRecord(recordUUID: string): Promise<RecordMetadata> {
  const data = await API.post(
    'provider',
    '/provider/record/sealById/' + recordUUID,
    {
      body: {},
    }
  )
  return recordMetadataSchema.parse(data.record)
}
