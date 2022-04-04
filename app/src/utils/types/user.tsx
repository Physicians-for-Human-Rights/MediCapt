import { z } from 'zod'

export const userSchema = z
  .object({
    'storage-version': z.literal('1.0.0'),
    userUUID: z.string().nonempty(),
    userID: z.string().nonempty(),
    created_time: z.date(),
    last_updated_time: z.date(),
    email: z.string().nonempty(),
    birthdate: z.string().nonempty(),
    name: z.string().nonempty(),
    nickname: z.string().nonempty(),
    formal_name: z.string().nonempty(),
    gender: z.string().nonempty(),
    phone_number: z.string().nonempty(),
    official_id_type: z.string().nonempty(),
    official_id_code: z.string().nonempty(),
    official_id_expires: z.string().nonempty(),
    official_id_image: z.string().nonempty(),
    country: z.string().nonempty(),
    language: z.string().nonempty(),
    expiryDate: z.string().nonempty(),
    allowed_locations: z.array(z.string()),
    created_by: z.string().nonempty(),
  })
  .strict()

export type UserType = z.infer<typeof userSchema>
