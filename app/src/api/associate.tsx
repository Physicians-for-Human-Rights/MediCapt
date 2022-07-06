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
  ShareGetServer,
} from 'utils/types/share'

// User

export async function getUserByUsername(
  poolId: string,
  username: string
): Promise<Partial<UserType>> {
  const data = await API.get(
    'associate',
    '/associate/user/byId/' + poolId + '/' + username,
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
    'associate',
    '/associate/user/byUUID/' + poolId + '/' + uuid,
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
    'associate',
    '/associate/user/byUUIDAnyPool/' + uuid,
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
    'associate',
    '/associate/location/byId/' + locationUUID,
    {
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(locationSchema)),
      },
    }
  )
  return locationSchema.parse(data)
}

// Sharing

export async function getRecordShare(
  shareUUID: string
): Promise<ShareGetServer> {
  const data = await API.get(
    'associate',
    '/associate/share/record/byId/' + shareUUID,
    {
      body: shareUUID,
      headers: {
        AcceptedVersions: '1.0.0',
      },
    }
  )
  return {
    share: shareSchema.parse(data.share),
    form: {
      metadata: formMetadataSchema.parse(data.form.metadata),
      manifest: formManifestWithLinksSchema.parse(data.form.manifest),
    },
    record: {
      metadata: recordMetadataSchema.parse(data.record.metadata),
      manifest: recordManifestWithLinksSchema.parse(data.record.manifest),
    },
  }
}

export async function deleteRecordShare(shareUUID: string) {
  await API.del('associate', '/associate/share/record/byId/' + shareUUID, {
    body: shareUUID,
    headers: {
      AcceptedVersions: '1.0.0',
    },
  })
}

export type GetSharesFilters = {
  locationId?: string
  createdByUUID?: string
  searchType?: string
  text?: string
}
export async function getRecordShares(
  filters: GetSharesFilters
): Promise<[Share[], string | undefined]> {
  let queryFilters: QueryFilterForType<Share> = []
  if (filters.locationId)
    queryFilters.push({ locationID: { eq: filters.locationId } })
  if (filters.createdByUUID)
    queryFilters.push({ createdByUUID: { eq: filters.createdByUUID } })
  // TODO Implement text filters here (not hanlded by the backend)
  // if (filters.text) queryFilters.push({ text: { eq: filters.text } })

  const data = await API.get('associate', '/associate/share/record', {
    queryStringParameters: {
      filter: JSON.stringify(queryFilters),
    },
    headers: {
      AcceptedVersions: JSON.stringify(schemaVersions(shareSchema)),
    },
  })

  return [
    _.map(data.items, item => shareSchema.parse(item)),
    z.string().optional().parse(data.nextKey),
  ]
}
