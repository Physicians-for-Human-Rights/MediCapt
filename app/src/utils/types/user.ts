export type UserType = {
  'storage-version': '1.0.0'
  // This is the unique id you get from cognito
  sub: string
  created_time: Date
  last_updated_time: Date
  email: string
  birthdate: string
  name: string
  nickname: string
  formal_name: string
  gender: string
  phone_number: string
  official_id_type: string
  official_id_code: string
  official_id_expires: string
  official_id_image: string
  country: string
  language: string
  expiryDate: string
  allowed_locations: string[]
  created_by: string
}
