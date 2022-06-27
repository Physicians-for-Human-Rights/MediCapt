import _ from 'lodash'
import { API } from 'aws-amplify'
import { LocationType, locationSchema } from 'utils/types/location'
import { UserType, userSchema } from 'utils/types/user'
import {
  formMetadataSchemaByUser,
  formMetadataSchema,
  formManifestWithLinksSchema,
  FormMetadataByUser,
  FormMetadata,
  formManifestWithMD5Schema,
  FormManifestWithMD5,
  FormPostServer,
  FormGetServer,
  formManifestWithPostLinksSchema,
} from 'utils/types/formMetadata'
import { QueryFilterForType } from 'utils/types/url'
import { schemaVersions } from 'api/utils'

// User

export async function getUserByUsername(
  poolId: string,
  username: string
): Promise<Partial<UserType>> {
  const data = await API.get(
    'formdesigner',
    '/formdesigner/user/byId/' + poolId + '/' + username,
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
    'formdesigner',
    '/formdesigner/user/byUUID/' + poolId + '/' + uuid,
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
    'formdesigner',
    '/formdesigner/location/byId/' + locationUUID,
    {
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(locationSchema)),
      },
    }
  )
  return locationSchema.parse(data)
}

// Forms

export async function createForm(
  form: FormMetadataByUser
): Promise<FormMetadata> {
  const data = await API.post('formdesigner', '/formdesigner/form', {
    body: formMetadataSchemaByUser.strip().parse(form),
    headers: {
      AcceptedVersions: JSON.stringify(schemaVersions(formMetadataSchema)),
    },
  })
  return formMetadataSchema.parse(data)
}

export async function updateForm(
  metadata: FormMetadata,
  manifest: FormManifestWithMD5
): Promise<FormPostServer> {
  const data = await API.post(
    'formdesigner',
    '/formdesigner/form/byId/' + metadata.formUUID,
    {
      body: {
        metadata: formMetadataSchema.parse(metadata),
        manifest: formManifestWithMD5Schema.parse(manifest),
      },
      headers: {
        AcceptedVersions: JSON.stringify({
          metadata: schemaVersions(formMetadataSchema),
          manifest: schemaVersions(formManifestWithPostLinksSchema),
        }),
      },
    }
  )
  return {
    metadata: formMetadataSchema.parse(data.metadata),
    manifest: formManifestWithPostLinksSchema.parse(data.manifest),
  }
}

export async function commitForm(
  formUUID: string,
  metadata: FormMetadata
): Promise<FormMetadata> {
  const data = await API.post(
    'formdesigner',
    '/formdesigner/form/commitById/' + formUUID,
    {
      body: formMetadataSchema.parse(metadata),
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(formMetadataSchema)),
      },
    }
  )
  return formMetadataSchema.parse(data.form)
}

export async function getFormMetadata(formUUID: string): Promise<FormMetadata> {
  const data = await API.get(
    'formdesigner',
    '/formdesigner/form/metadataById/' + formUUID,
    {
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(formMetadataSchema)),
      },
    }
  )
  return formMetadataSchema.parse(data.metadata)
}

export async function getForm(formUUID: string): Promise<FormGetServer> {
  const data = await API.get(
    'formdesigner',
    '/formdesigner/form/byId/' + formUUID,
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

export async function findForms(
  pre: () => any,
  post: () => any,
  filterCountry: string | undefined,
  filterLanguage: string | undefined,
  filterLocationID: string | undefined,
  filterEnabled: string | undefined,
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
    if (filterEnabled) filters.push({ enabled: { eq: filterEnabled } })
    if (filterText) filters.push({ locationID: { eq: filterText } })
    const data = await API.get('formdesigner', '/formdesigner/form', {
      queryStringParameters: {
        filter: JSON.stringify(filters),
      },
      headers: {
        AcceptedVersions: JSON.stringify(schemaVersions(formMetadataSchema)),
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
