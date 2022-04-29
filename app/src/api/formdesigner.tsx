import _ from 'lodash'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  Feather,
  MaterialIcons,
} from '@expo/vector-icons'
import { API } from 'aws-amplify'
import {
  LocationType,
  locationSchema,
  LocationByUserType,
  locationSchemaByUser,
} from 'utils/types/location'
import {
  UserType,
  userSchema,
  UserByUserType,
  userSchemaByUser,
} from 'utils/types/user'
import { FormType } from 'utils/types/form'
import {
  formMetadataSchemaByUser,
  formMetadataSchema,
  formManifestSchema,
  formManifestWithLinksSchema,
  FormMetadataByUser,
  FormMetadata,
  FormManifest,
  FormManifestWithLinks,
  formManifestWithMD5Schema,
  FormManifestWithMD5,
  FormPostServer,
  FormGetServer,
  formManifestWithPostLinksSchema,
} from 'utils/types/formMetadata'
import { QueryFilterForType } from 'utils/types/url'

// User

export async function getUser(
  poolId: string,
  username: string
): Promise<Partial<UserType>> {
  const data = await API.get(
    'formdesigner',
    '/formdesigner/user/byId/' + poolId + '/' + username,
    {}
  )
  return userSchema.parse(data)
}

// Location

export async function getLocation(locationUUID: string): Promise<LocationType> {
  const data = await API.get(
    'formdesigner',
    '/formdesigner/location/byId/' + locationUUID,
    {}
  )
  return locationSchema.parse(data)
}

// Forms

export async function createForm(
  form: FormMetadataByUser
): Promise<FormMetadata> {
  const data = await API.post('formdesigner', '/formdesigner/form', {
    body: formMetadataSchemaByUser.strip().parse(form),
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
    }
  )
  return formMetadataSchema.parse(data.form)
}

export async function getFormMetadata(formUUID: string): Promise<FormMetadata> {
  const data = await API.get(
    'formdesigner',
    '/formdesigner/form/metadataById/' + formUUID,
    {}
  )
  return formMetadataSchema.parse(data.metadata)
}

export async function getForm(formUUID: string): Promise<FormGetServer> {
  const data = await API.get(
    'formdesigner',
    '/formdesigner/form/byId/' + formUUID,
    {}
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
