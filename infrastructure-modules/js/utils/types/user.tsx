import { z } from 'zod'
import { dateSchema, stringSetSchema } from 'utils/types/common'
import _ from 'lodash'

// From Cognito
export const userStatus = [
  'UNCONFIRMED', // User has been created but not confirmed
  'CONFIRMED', // User has been confirmed
  'ARCHIVED', // User is no longer active
  'COMPROMISED', // User is disabled due to a potential security threat
  'UNKNOWN', // User status isn't known
  'RESET_REQUIRED', // User is confirmed, but the user must request a code and reset their password before they can sign in
  'FORCE_CHANGE_PASSWORD', // The user is confirmed and the user can sign in using a temporary password, but on first sign//in, the user must change their password to a new value before doing anything else.
] as const

export const userType = [
  'Provider',
  'Associate',
  'Manager',
  'FormDesigner',
  'Researcher',
] as const

export const userTypeSchema = z.enum(userType)

export const userSchemaByUser = z.object({
  'storage-version': z.literal('1.0.0'),
  username: z.string().nonempty(),
  email: z.string().nonempty(),
  birthdate: dateSchema,
  name: z.string().nonempty(),
  nickname: z.string().nonempty(),
  formal_name: z.string().nonempty(),
  gender: z.string().nonempty(),
  phone_number: z.string().nonempty(),
  official_id_type: z.string().nonempty(),
  official_id_code: z.string().nonempty(),
  official_id_expires: dateSchema,
  official_id_image: z.string().nonempty(),
  address: z.string().nonempty(),
  country: z.string().nonempty(),
  language: z.string().nonempty(),
  expiry_date: dateSchema,
  allowed_locations: z.string(),
  userType: userTypeSchema,
  enabled: z.boolean(),
})

export const userSchema = userSchemaByUser
  .extend({
    'storage-version': z.literal('1.0.0'),
    userUUID: z.string().nonempty(),
    userID: z.string().nonempty(),
    created_by: z.string().nonempty(),
    created_time: dateSchema,
    last_updated_time: dateSchema,
    status: z.string().optional(),
  })
  .strip()

export type UserTypeList = z.infer<typeof userTypeSchema>
export type UserByUserType = z.infer<typeof userSchemaByUser>
export type UserType = z.infer<typeof userSchema>
export type UserTypeFilter = UserType & Record<string, string>

export function splitLocations(l: string | undefined) {
  if (l) return _.difference(_.split(l, ' '), [''])
  else return []
}
