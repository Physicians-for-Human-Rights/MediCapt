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
  recordManifestWithPostLinksSchema,
  RecordGetServer,
} from 'utils/types/recordMetadata'
import { QueryFilterForType } from 'utils/types/url'
import { z } from 'zod'
import { schemaVersions, findUsersWrapper } from 'api/utils'
import {
  shareSchemaByUser,
  shareSchema,
  ShareByUser,
  Share,
} from 'utils/types/share'

// User

export async function getUserByUsername(
  poolId: string,
  username: string
): Promise<Partial<UserType>> {
  const data = await API.get(
    'provider',
    '/provider/user/byId/' + poolId + '/' + username,
    {
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(userSchema)),
      },
    }
  )
  return userSchema.partial().parse(data)
}

export async function getUserByUUID(
  poolId: string,
  uuid: string
): Promise<Partial<UserType>> {
  const data = await API.get(
    'provider',
    '/provider/user/byUUID/' + poolId + '/' + uuid,
    {
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(userSchema)),
      },
    }
  )
  return userSchema.partial().parse(data)
}

export async function getUserByUUIDAnyPool(
  uuid: string
): Promise<Partial<UserType>> {
  const data = await API.get(
    'provider',
    '/provider/user/byUUIDAnyPool/' + uuid,
    {
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(userSchema)),
      },
    }
  )
  return userSchema.partial().parse(data)
}

export async function findUsers(
  pre: () => any,
  post: () => any,
  filterEnabledOrDisabled: string | undefined,
  filterLocation: string | undefined,
  filterSearchType: string | undefined,
  filterText: string | undefined,
  filterUserType: string | undefined,
  handleErrors: (err: any) => any,
  setUsers: (users: UserType[]) => any,
  setNextKey: (key: string) => any
) {
  return await findUsersWrapper('provider')(
    pre,
    post,
    filterEnabledOrDisabled,
    filterLocation,
    filterSearchType,
    filterText,
    filterUserType,
    handleErrors,
    setUsers,
    setNextKey
  )
}

// Location

export async function getLocation(locationUUID: string): Promise<LocationType> {
  const data = await API.get(
    'provider',
    '/provider/location/byId/' + locationUUID,
    {
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(locationSchema)),
      },
    }
  )
  return locationSchema.parse(data)
}

// Forms

export async function getFormMetadata(formUUID: string): Promise<FormMetadata> {
  const data = await API.get(
    'provider',
    '/provider/form/metadataById/' + formUUID,
    {
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(formMetadataSchema)),
      },
    }
  )
  return formMetadataSchema.parse(data.metadata)
}

export async function getForm(formUUID: string): Promise<FormGetServer> {
  const data = await API.get('provider', '/provider/form/byId/' + formUUID, {
    headers: {
      AcceptedVersions: JSON.stringify({
        metadata: schemaVersions(formMetadataSchema),
        manifest: schemaVersions(formManifestWithLinksSchema),
      }),
    },
  })
  return {
    metadata: formMetadataSchema.parse(data.metadata),
    manifest: formManifestWithLinksSchema.parse(data.manifest),
  }
}

export async function getFormVersion(
  formUUID: string,
  version: string
): Promise<FormGetServer> {
  const data = await API.get(
    'provider',
    '/provider/form/byId/' + formUUID + '/' + version,
    {
      headers: {
        AcceptedVersions: JSON.stringify({
          metadata: schemaVersions(formMetadataSchema),
          manifest: schemaVersions(formManifestWithLinksSchema),
        }),
      },
    }
  )
  return {
    metadata: formMetadataSchema.parse(data.metadata),
    manifest: formManifestWithLinksSchema.parse(data.manifest),
  }
}

export type GetFormsFilters = {
  country?: string
  language?: string
  locationId?: string
  text?: string
  searchType?: string
}
export async function getForms(
  filters: GetFormsFilters
): Promise<[FormMetadata[], string | undefined]> {
  let queryFilters: QueryFilterForType<LocationType> = []
  if (filters.country) queryFilters.push({ country: { eq: filters.country } })
  if (filters.language)
    queryFilters.push({ language: { eq: filters.language } })
  if (filters.locationId)
    queryFilters.push({ locationID: { eq: filters.locationId } })
  if (filters.text) queryFilters.push({ locationID: { eq: filters.text } })

  //
  // NB Providers are only allowed to see forms which are enabled
  queryFilters.push({ enabled: { eq: 'enabled' } })
  const data = await API.get('provider', '/provider/form', {
    queryStringParameters: {
      filter: JSON.stringify(queryFilters),
    },
    headers: {
      AcceptedVersions: JSON.stringify(schemaVersions(formMetadataSchema)),
    },
  })

  return [
    _.map(data.items, item => formMetadataSchema.parse(item)),
    z.string().optional().parse(data.nextKey),
  ]
}

// Records

export async function createRecord(
  record: RecordMetadataByUser
): Promise<RecordMetadata> {
  const data = await API.post('provider', '/provider/record', {
    body: recordMetadataSchemaByUser.strip().parse(record),
    headers: {
      AcceptedVersions: JSON.stringify(schemaVersions(recordMetadataSchema)),
    },
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
      headers: {
        AcceptedVersions: JSON.stringify({
          metadata: schemaVersions(recordMetadataSchema),
          manifest: schemaVersions(recordManifestWithPostLinksSchema),
        }),
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
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(recordMetadataSchema)),
      },
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
    {
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(recordMetadataSchema)),
      },
    }
  )
  return recordMetadataSchema.parse(data.metadata)
}

export async function getRecord(recordUUID: string): Promise<RecordGetServer> {
  const data = await API.get(
    'provider',
    '/provider/record/byId/' + recordUUID,
    {
      headers: {
        AcceptedVersions: JSON.stringify({
          metadata: schemaVersions(recordMetadataSchema),
          manifest: schemaVersions(recordManifestWithLinksSchema),
        }),
      },
    }
  )
  return {
    metadata: recordMetadataSchema.parse(data.metadata),
    manifest: recordManifestWithLinksSchema.parse(data.manifest),
  }
}

export type GetRecordsFilters = {
  locationId?: string
  createdByUUID?: string
  lastChangedByUUID?: string
  sealed?: string
  searchType?: string
  text?: string
}
export async function getRecords(
  filters: GetRecordsFilters
): Promise<[RecordMetadata[], string | undefined]> {
  let queryFilters: QueryFilterForType<RecordMetadata> = []
  if (filters.locationId)
    queryFilters.push({ locationID: { eq: filters.locationId } })
  if (filters.sealed) queryFilters.push({ sealed: { eq: filters.sealed } })
  if (filters.createdByUUID)
    queryFilters.push({ createdByUUID: { eq: filters.createdByUUID } })
  if (filters.lastChangedByUUID)
    queryFilters.push({ lastChangedByUUID: { eq: filters.lastChangedByUUID } })
  // TODO Implement text filters here (not hanlded by the backend)
  // if (filters.text) queryFilters.push({ text: { eq: filters.text } })

  const data = await API.get('provider', '/provider/record', {
    queryStringParameters: {
      filter: JSON.stringify(queryFilters),
    },
    headers: {
      AcceptedVersions: JSON.stringify(schemaVersions(recordMetadataSchema)),
    },
  })

  return [
    _.map(data.items, item => recordMetadataSchema.parse(item)),
    z.string().optional().parse(data.nextKey),
  ]
}

export async function sealRecord(
  metadata: RecordMetadata
): Promise<RecordMetadata> {
  const data = await API.post(
    'provider',
    '/provider/record/sealById/' + metadata.recordUUID,
    {
      body: recordMetadataSchema.parse(metadata),
      headers: {
        AcceptedVersions: schemaVersions(recordMetadataSchema),
      },
    }
  )
  return recordMetadataSchema.parse(data.record)
}

// Sharing

export async function getSharesForRecord(recordUUID: string): Promise<Share[]> {
  const data = await API.get(
    'provider',
    '/provider/share/record/byRecordId/' + recordUUID,
    {
      body: recordUUID,
      headers: {
        AcceptedVersions: '1.0.0',
      },
    }
  )
  return _.map(data.items, item => shareSchema.parse(item))
}

export async function createShareForRecord(share: ShareByUser): Promise<Share> {
  const data = await API.post(
    'provider',
    '/provider/share/record/byRecordId/' + share.recordUUID,
    {
      body: share,
      headers: {
        AcceptedVersions: '1.0.0',
      },
    }
  )
  return shareSchema.parse(data)
}
