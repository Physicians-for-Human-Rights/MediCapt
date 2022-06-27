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
import { schemaVersions } from 'api/utils'

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
  country?: string
  language?: string
  locationId?: string
  enabled?: string
  searchType?: string
  text?: string
}
export async function getRecords(
  filters: GetRecordsFilters
): Promise<[RecordMetadata[], string | undefined]> {
  let queryFilters: QueryFilterForType<LocationType> = []
  if (filters.country) queryFilters.push({ country: { eq: filters.country } })
  if (filters.language)
    queryFilters.push({ language: { eq: filters.language } })
  if (filters.locationId)
    queryFilters.push({ locationID: { eq: filters.locationId } })
  if (filters.enabled) queryFilters.push({ enabled: { eq: filters.enabled } })
  if (filters.text) queryFilters.push({ locationID: { eq: filters.text } })

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

export async function sealRecord(recordUUID: string): Promise<RecordMetadata> {
  const data = await API.post(
    'provider',
    '/provider/record/sealById/' + recordUUID,
    {
      body: {
        headers: {
          AcceptedVersions: JSON.stringify(
            schemaVersions(recordMetadataSchema)
          ),
        },
      },
    }
  )
  return recordMetadataSchema.parse(data.record)
}
