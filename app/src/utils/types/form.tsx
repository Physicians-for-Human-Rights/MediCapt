import { z } from 'zod'

export type FormType = {
  uuid: string
  title: string
  subtitle?: string
  'official-name': string
  'official-code'?: string
  version?: string
  'storage-version'?: '1.0.0'
  description?: string
  tags?: string[]
  country: string
  language: string
  date: Date
  // A consent entry must exist and must be the first entry unless this is set.
  skipConsent?: boolean
  // Main contents
  // Definitions you can refernece with Ref
  common: Record<string, FormDefinition>
  sections: Array<FormSectionMap>
}

export const formMetadataSchema = z
  .object({
    country: z.string().nonempty(),
    formUUID: z.string().nonempty(),
    formID: z.string().nonempty(),
    locationUUID: z.string().nonempty(),
    language: z.string().nonempty(),
    officialName: z.string().nonempty(),
    title: z.string().nonempty(),
    subtitle: z.string().nonempty(),
    createdDate: z.date(),
    formId: z.string().nonempty(),
    priority: z.string().nonempty(),
    version: z.string().nonempty(),
    createdByUUID: z.string().nonempty(),
    approvedByUUID: z.string().nonempty(),
    enabled: z.boolean(),
    enabledDate: z.date(),
    enabledSetByUUID: z.string().nonempty(),
    tags: z.string().nonempty(),
    formStorageVersion: z.literal('1.0.0'),
  })
  .strict()

export type FormMetadata = z.infer<typeof formMetadataSchema>

/**
   @minProperties 1
   @maxProperties 1
 */
export type FormPartMap = {
  [key: string]: FormPart
}
/**
   @minProperties 1
   @@maxProperties 1
 */
export type FormSectionMap = {
  [key: string]: FormSection
}
export type FormKVRawType = { key: string; value: SingleFormValueType }

export type FormPath = string

export type SingleFormValueType = string | number | boolean
export type MultipleFormValueTypes = string[] | number[] | boolean[]

export type FormValueType =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]

export type FormOnlyWhen = {
  path: string
  value: SingleFormValueType
}

export type FormRef = { Ref: string }

export type FormConditional = {
  optional?: boolean
  'only-when'?: FormOnlyWhen
  'only-not'?: FormOnlyWhen
  'only-sex'?: 'male' | 'female' | 'intersex' | 'any'
  'only-gender'?: string
  'only-child'?: boolean
}

export type FormPartCommon = {
  title: string | 'none'
  description?: string
  help?: string
  repeated?: boolean | 'at-least-one'
  'if-unknown'?: string
  'show-box'?: boolean
}

export type FormSubparts = {
  parts: Array<FormPartMap> | FormRef
}

export type FormPDF = {
  'pdf-field': {
    /**
         @minimum 0
         @maximum 10000
         @type integer
      */
    page: number
    name: string
  }
  'pdf-region': {
    page: number
    /**
         @minimum 0
         @maximum 10000
         @type integer
      */
    x: number
    /**
         @minimum 0
         @maximum 10000
         @type integer
      */
    y: number
    /**
         @minimum 0
         @maximum 10000
         @type integer
      */
    w: number
    /**
         @minimum 0
         @maximum 10000
         @type integer
      */
    h: number
  }
}

export type FormPartField =
  | {
      type: 'bool'
      'show-parts-when-true'?: Array<FormPartMap>
    }
  | {
      type: 'signature'
      signer?:
        | 'patient'
        | 'guardian'
        | 'healthcare-provider'
        | 'police-officer'
        | 'lawyer'
        | 'judge'
        | string
    }
  | {
      type: 'date'
      birthdate?: boolean
    }
  | {
      type: 'date-time'
    }
  | {
      type: 'gender'
    }
  | {
      type: 'number'
      placeholder?: string
    }
  | {
      type: 'sex'
    }
  | {
      type: 'list'
      other?: 'text' | 'long-text'
      options: MultipleFormValueTypes | FormRef
    }
  | {
      type: 'list-with-labels'
      other?: 'text' | 'long-text'
      options: Array<FormKVRawType> | FormRef
    }
  | {
      type: 'list-multiple'
      other?: 'text' | 'long-text'
      options: MultipleFormValueTypes | FormRef
    }
  | {
      type: 'list-with-labels-multiple'
      other?: 'text' | 'long-text'
      options: Array<FormKVRawType> | FormRef
    }
  | {
      type: 'list-with-parts'
      options: Array<FormPartMap> | FormRef
    }
  | {
      type: 'text'
      placeholder?: string
    }
  | {
      type: 'long-text'
      placeholder?: string
      /**
       @minimum 1
       @type integer
    */
      'number-of-lines'?: number
    }
  | {
      type: 'phone-number'
    }
  | {
      type: 'address'
      placeholder?: string
    }
  | {
      type: 'email'
      placeholder?: string
    }
  | {
      type: 'body-image'
      filename?: string
      'filename-female'?: string
      'filename-intersex'?: string
      'filename-male'?: string
      'text-box'?: boolean
    }
  | {
      type: 'photo'
      'needs-consent'?: boolean
      comment?: boolean | 'text' | 'long-text'
    }

export type FormPart =
  | (FormPartCommon &
      FormConditional &
      Partial<FormSubparts> &
      FormPartField &
      Partial<FormPDF>)
  | (FormPartCommon & FormConditional & FormSubparts)
  | FormRef

export type NonRefFormPart =
  | (FormPartCommon &
      FormConditional &
      Partial<FormSubparts> &
      FormPartField &
      Partial<FormPDF>)
  | (FormPartCommon & FormConditional & FormSubparts)

export type FormSection = {
  title: string
  parts: Array<FormPartMap>
} & FormConditional

export type FormDefinition =
  | Array<FormPartMap>
  | Array<FormKVRawType>
  | MultipleFormValueTypes
