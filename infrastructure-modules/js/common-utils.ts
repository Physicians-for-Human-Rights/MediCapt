import AWS from 'aws-sdk'
import _ from 'lodash'
import { z } from 'zod'
// @ts-ignore
import { typeOf } from 'aws-sdk/lib/dynamodb/types'
// @ts-ignore
import { DynamoDBSet } from 'aws-sdk/lib/dynamodb/set'
import { NumberValue } from 'aws-sdk/lib/dynamodb/numberValue'
import { HumanIDResponse } from 'services/human-id'
import {
  UserType as CognitoUserType,
  AdminGetUserResponse,
} from 'aws-sdk/clients/cognitoidentityserviceprovider'
import { UserType, userSchema, UserTypeList } from 'utils/types/user'
import {
  formMetadataSchemaStrip,
  formManifestSchema,
  FormManifestFileWithLink,
  FormManifestWithLinks,
  FormManifestFile,
} from 'utils/types/formMetadata'
import {
  recordMetadataSchemaStrip,
  RecordManifestFileWithLink,
  RecordManifestWithLinks,
  RecordManifestFile,
  recordManifestSchema,
} from 'utils/types/recordMetadata'

export function good(value: any) {
  return {
    statusCode: 200,
    body: JSON.stringify(value),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  }
}

export function bad(e: any, reason: string = 'Generic error') {
  return {
    statusCode: 400,
    body: JSON.stringify({
      error: { message: reason, detail: e },
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  }
}

export function isBad(e: any) {
  return e && 'statusCode' in e && e.statusCode !== 200
}

export async function machineIdToHumanId(
  uuid: string,
  prefix: string,
  lambda: any,
  humanid_lambda: string
) {
  const payload = JSON.stringify({
    action: 'machineID-to-humanID',
    machineID: uuid,
    suggestedPrefix: prefix,
  })
  const response = await lambda
    .invoke({
      FunctionName: humanid_lambda,
      Payload: payload,
    })
    .promise()
  if (response.Payload) {
    const ids = JSON.parse(response.Payload.toString()) as HumanIDResponse
    if ('failure' in ids && ids.failure) {
      throw new Error(JSON.stringify('Cannot get HumanID'))
    }
    if ('humanID' in ids) {
      return ids
    } else {
      throw new Error(JSON.stringify('Cannot get HumanID'))
    }
  } else {
    throw new Error(JSON.stringify('Cannot get HumanID' + response))
  }
}

export const DynamoDB = {
  /**
   * Convert a JavaScript value to its equivalent DynamoDB AttributeValue type
   *
   * @param data [any] The data to convert to a DynamoDB AttributeValue
   * @param options [map]
   * @option options convertEmptyValues [Boolean] Whether to automatically
   *                                              convert empty strings, blobs,
   *                                              and sets to `null`
   * @option options wrapNumbers [Boolean]  Whether to return numbers as a
   *                                        NumberValue object instead of
   *                                        converting them to native JavaScript
   *                                        numbers. This allows for the safe
   *                                        round-trip transport of numbers of
   *                                        arbitrary size.
   * @return [map] An object in the Amazon DynamoDB AttributeValue format
   *
   * @see AWS.DynamoDB.Converter.marshall AWS.DynamoDB.Converter.marshall to
   *    convert entire records (rather than individual attributes)
   */
  input: function convertInput(
    data: any,
    options?: AWS.DynamoDB.DocumentClient.ConverterOptions
  ): any {
    options = options || {}
    var type: string = typeOf(data)
    if (_.isDate(data)) {
      return convertInput(data.toISOString(), options)
    } else if (type === 'Object') {
      return formatMap(data, options)
    } else if (type === 'Array') {
      return formatList(data, options)
    } else if (type === 'Set') {
      return formatSet(data, options)
    } else if (type === 'String') {
      if (data.length === 0 && options.convertEmptyValues) {
        return convertInput(null)
      }
      return { S: data }
    } else if (type === 'Number' || type === 'NumberValue') {
      return { N: data.toString() }
    } else if (type === 'Binary') {
      if (data.length === 0 && options.convertEmptyValues) {
        return convertInput(null)
      }
      return { B: data }
    } else if (type === 'Boolean') {
      return { BOOL: data }
    } else if (type === 'null') {
      return { NULL: true }
    } else if (type !== 'undefined' && type !== 'Function') {
      // this value has a custom constructor
      return formatMap(data, options)
    }
  },

  /**
   * Convert a JavaScript object into a DynamoDB record.
   *
   * @param data [any] The data to convert to a DynamoDB record
   * @param options [map]
   * @option options convertEmptyValues [Boolean] Whether to automatically
   *                                              convert empty strings, blobs,
   *                                              and sets to `null`
   * @option options wrapNumbers [Boolean]  Whether to return numbers as a
   *                                        NumberValue object instead of
   *                                        converting them to native JavaScript
   *                                        numbers. This allows for the safe
   *                                        round-trip transport of numbers of
   *                                        arbitrary size.
   *
   * @return [map] An object in the DynamoDB record format.
   *
   * @example Convert a JavaScript object into a DynamoDB record
   *  var marshalled = AWS.DynamoDB.Converter.marshall({
   *    string: 'foo',
   *    list: ['fizz', 'buzz', 'pop'],
   *    map: {
   *      nestedMap: {
   *        key: 'value',
   *      }
   *    },
   *    number: 123,
   *    nullValue: null,
   *    boolValue: true,
   *    stringSet: new DynamoDBSet(['foo', 'bar', 'baz'])
   *  });
   */
  marshall: function marshallItem(
    data: any,
    options?: AWS.DynamoDB.DocumentClient.ConverterOptions
  ) {
    return DynamoDB.input(data, options).M
  },

  /**
   * Convert a DynamoDB AttributeValue object to its equivalent JavaScript type.
   *
   * @param data [map] An object in the Amazon DynamoDB AttributeValue format
   * @param options [map]
   * @option options convertEmptyValues [Boolean] Whether to automatically
   *                                              convert empty strings, blobs,
   *                                              and sets to `null`
   * @option options wrapNumbers [Boolean]  Whether to return numbers as a
   *                                        NumberValue object instead of
   *                                        converting them to native JavaScript
   *                                        numbers. This allows for the safe
   *                                        round-trip transport of numbers of
   *                                        arbitrary size.
   *
   * @return [Object|Array|String|Number|Boolean|null]
   *
   * @see AWS.DynamoDB.Converter.unmarshall AWS.DynamoDB.Converter.unmarshall to
   *    convert entire records (rather than individual attributes)
   */
  output: function convertOutput(
    data: any,
    options?: AWS.DynamoDB.DocumentClient.ConverterOptions
  ): any {
    options = options || {}
    var list, map, i
    for (var type in data) {
      var values = data[type]
      if (type === 'M') {
        map = {}
        for (var key in values) {
          // @ts-ignore
          map[key] = convertOutput(values[key], options)
        }
        return map
      } else if (type === 'L') {
        list = []
        for (i = 0; i < values.length; i++) {
          list.push(convertOutput(values[i], options))
        }
        return list
      } else if (type === 'SS') {
        list = []
        for (i = 0; i < values.length; i++) {
          list.push(values[i] + '')
        }
        return new DynamoDBSet(list)
      } else if (type === 'NS') {
        list = []
        for (i = 0; i < values.length; i++) {
          list.push(convertNumber(values[i], options.wrapNumbers))
        }
        return new DynamoDBSet(list)
      } else if (type === 'BS') {
        list = []
        for (i = 0; i < values.length; i++) {
          // @ts-ignore
          list.push(AWS.util.buffer.toBuffer(values[i]))
        }
        return new DynamoDBSet(list)
      } else if (type === 'S') {
        return values + ''
      } else if (type === 'N') {
        return convertNumber(values, options.wrapNumbers)
      } else if (type === 'B') {
        // @ts-ignore
        return AWS.util.buffer.toBuffer(values)
      } else if (type === 'BOOL') {
        return values === 'true' || values === 'TRUE' || values === true
      } else if (type === 'NULL') {
        return null
      }
    }
  },

  /**
   * Convert a DynamoDB record into a JavaScript object.
   *
   * @param data [any] The DynamoDB record
   * @param options [map]
   * @option options convertEmptyValues [Boolean] Whether to automatically
   *                                              convert empty strings, blobs,
   *                                              and sets to `null`
   * @option options wrapNumbers [Boolean]  Whether to return numbers as a
   *                                        NumberValue object instead of
   *                                        converting them to native JavaScript
   *                                        numbers. This allows for the safe
   *                                        round-trip transport of numbers of
   *                                        arbitrary size.
   *
   * @return [map] An object whose properties have been converted from
   *    DynamoDB's AttributeValue format into their corresponding native
   *    JavaScript types.
   *
   * @example Convert a record received from a DynamoDB stream
   *  var unmarshalled = AWS.DynamoDB.Converter.unmarshall({
   *    string: {S: 'foo'},
   *    list: {L: [{S: 'fizz'}, {S: 'buzz'}, {S: 'pop'}]},
   *    map: {
   *      M: {
   *        nestedMap: {
   *          M: {
   *            key: {S: 'value'}
   *          }
   *        }
   *      }
   *    },
   *    number: {N: '123'},
   *    nullValue: {NULL: true},
   *    boolValue: {BOOL: true}
   *  });
   */
  unmarshall: function unmarshall(
    data: any,
    options?: AWS.DynamoDB.DocumentClient.ConverterOptions
  ) {
    return DynamoDB.output({ M: data }, options)
  },
}

function formatList(data: any, options: any) {
  var list = { L: [] }
  for (var i = 0; i < data.length; i++) {
    // @ts-ignore
    list['L'].push(DynamoDB.input(data[i], options))
  }
  return list
}

function convertNumber(value: any, wrapNumbers: any) {
  return wrapNumbers ? new NumberValue(value) : Number(value)
}

function formatMap(data: any, options: any) {
  var map = { M: {} }
  for (var key in data) {
    var formatted = DynamoDB.input(data[key], options)
    if (formatted !== void 0) {
      // @ts-ignore
      map['M'][key] = formatted
    }
  }
  return map
}

function formatSet(data: any, options: any) {
  options = options || {}
  var values = data.values
  if (options.convertEmptyValues) {
    values = filterEmptySetValues(data)
  }
  if (values.length === 0) {
    return DynamoDB.input(null)
  }
  var map = {}
  switch (data.type) {
    case 'String':
      // @ts-ignore
      map['SS'] = values
      break
    case 'Binary':
      // @ts-ignore
      map['BS'] = values
      break
    case 'Number':
      // @ts-ignore
      map['NS'] = values.map(function (value) {
        return value.toString()
      })
  }
  return map
}

function filterEmptySetValues(set: any) {
  var nonEmptyValues = []
  var potentiallyEmptyTypes = {
    String: true,
    Binary: true,
    Number: false,
  }
  // @ts-ignore
  if (potentiallyEmptyTypes[set.type]) {
    for (var i = 0; i < set.values.length; i++) {
      if (set.values[i].length === 0) {
        continue
      }
      nonEmptyValues.push(set.values[i])
    }
    return nonEmptyValues
  }
  return set.values
}

export async function simpleDynamoQuery(
  ddb: AWS.DynamoDB,
  startKey: AWS.DynamoDB.Key | undefined,
  table: string,
  gsi: string | undefined,
  pk: string,
  pkValue: string,
  sk?: string | undefined,
  skValue?: string | undefined,
  skBeginsWith?: boolean | undefined
) {
  return await ddb
    .query({
      TableName: table,
      IndexName: gsi,
      Select: 'ALL_ATTRIBUTES',
      ExclusiveStartKey: startKey,
      ScanIndexForward: false,
      KeyConditionExpression:
        '#pk = :pk' +
        (sk
          ? skBeginsWith
            ? ' And begins_with(#sk, :sk)'
            : ' And #sk = :sk'
          : ''),
      ExpressionAttributeNames: {
        '#pk': pk,
        ...(sk && { '#sk': sk }),
      },
      ExpressionAttributeValues: {
        ':pk': { S: pkValue },
        ...(sk && { ':sk': { S: skValue } }),
      },
    })
    .promise()
}

function sanitizeKey(key: string) {
  return _.replace(_.replace(key, '-', 'DASH'), '_', 'UNDERSCORE')
}

export function zodDynamoUpdateExpression<T extends z.AnyZodObject>(
  schema: T,
  o: z.infer<T>
) {
  // NB This would be a SQL injection, except that we only rely on the keys of a
  // schema (not of a runtime object) and all Zod schemas are statically
  // defined at compile time.
  return (
    'SET ' +
    _.join(
      _.map(
        _.intersection(_.keys(schema.shape), _.keys(o)),
        k => '#' + sanitizeKey(k) + ' = :' + sanitizeKey(k)
      ),
      ', '
    )
  )
}

// TODO Upgrade this type so that the object and schema must agree on their types
export function zodDynamoAttributeValues<T extends z.AnyZodObject>(
  schema: T,
  o: z.infer<T>
) {
  return DynamoDB.marshall(
    _.mapKeys(
      _.mapValues(schema.shape, (v, k) => o[k]),
      (v, k) => ':' + sanitizeKey(k)
    )
  )
}

// TODO Upgrade this type so that the object and schema must agree on their types
export function zodDynamoAttributeNames<T extends z.AnyZodObject>(
  schema: T,
  o: z.infer<T>
) {
  return _.mapKeys(
    _.pick(
      _.mapValues(schema.shape, (v, k) => k),
      _.keys(o)
    ),
    (v, k) => '#' + sanitizeKey(k)
  )
}

export async function multiplePages<R, T>(
  startToken: string | undefined,
  fn: (nextToken: string | undefined) => Promise<T>,
  getItems: (result: T) => R[],
  getNextToken: (result: T) => string | undefined,
  maxPages: number
): Promise<{ items: R[]; nextToken: string | undefined }> {
  const result = await fn(startToken)
  getItems(result)
  const token = getNextToken(result)
  if (token && maxPages > 0) {
    const rest = await multiplePages<R, T>(
      token,
      fn,
      getItems,
      getNextToken,
      maxPages - 1
    )
    return {
      items: _.concat(getItems(result), rest.items),
      nextToken: rest.nextToken,
    }
  }
  return { items: getItems(result), nextToken: token }
}

export function findUserAttribute(
  u: CognitoUserType | AdminGetUserResponse,
  name: string
) {
  // @ts-ignore One of these two is guaranteed to exist
  const x = _.find(u.Attributes || u.UserAttributes, a => a.Name === name)
  if (x && x.Value) {
    return x.Value
  }
  return undefined
}

export function verifyValue<T>(a: T | undefined, msg: string): T {
  if (a === undefined) throw msg
  return a
}

export function convertCognitoUser(
  u: CognitoUserType,
  image_bucket_id: string,
  userType: UserTypeList | undefined,
  s3: AWS.S3
): Partial<UserType> {
  if (
    findUserAttribute(u, 'custom:storage_version') &&
    findUserAttribute(u, 'custom:storage_version') !== '1.0.0'
  ) {
    throw 'Unknown storage version'
  }
  const rawIdImage = findUserAttribute(u, 'custom:official_id_image')
  let idImage = 'none'
  if (rawIdImage && rawIdImage !== 'none') {
    idImage = s3.getSignedUrl('getObject', {
      Bucket: image_bucket_id,
      Key: rawIdImage,
    })
  }
  // NB Ideally, if any attributes are missing we would fail. But, a dev
  // could add users to cognito manually. These users could then never
  // be managed if their types don't line up correctly.
  const bd = findUserAttribute(u, 'birthdate')
  const id_ex = findUserAttribute(u, 'custom:official_id_expires')
  const ex = findUserAttribute(u, 'custom:expiry_date')
  const oneUser: Partial<UserType> = {
    'storage-version': '1.0.0',
    userUUID: findUserAttribute(u, 'sub'),
    userID: findUserAttribute(u, 'custom:human_id'),
    created_time: verifyValue(u.UserCreateDate, 'missing creation time'),
    last_updated_time: verifyValue(
      u.UserLastModifiedDate,
      'missing modified time'
    ),
    username: verifyValue(u.Username, 'missing username'),
    email: findUserAttribute(u, 'email'),
    birthdate: bd ? new Date(bd) : undefined,
    name: findUserAttribute(u, 'name'),
    nickname: findUserAttribute(u, 'nickname'),
    formal_name: findUserAttribute(u, 'custom:formal_name'),
    gender: findUserAttribute(u, 'gender'),
    phone_number: findUserAttribute(u, 'phone_number'),
    official_id_type: findUserAttribute(u, 'custom:official_id_type'),
    official_id_code: findUserAttribute(u, 'custom:official_id_code'),
    official_id_expires: id_ex ? new Date(id_ex) : undefined,
    official_id_image: idImage,
    address: findUserAttribute(u, 'address'),
    country: findUserAttribute(u, 'custom:country'),
    language: findUserAttribute(u, 'custom:language'),
    expiry_date: ex ? new Date(ex) : undefined,
    allowed_locations: findUserAttribute(u, 'custom:allowed_locations'),
    created_by: findUserAttribute(u, 'custom:created_by'),
    userType,
    enabled: verifyValue<boolean>(u.Enabled, 'Missing enabled/disabled'),
    status: u.UserStatus,
    email_verified: findUserAttribute(u, 'email_verified'),
  }
  return userSchema.partial().parse(oneUser)
}

export async function s3ObjectExists(bucket: string, key: string, s3: AWS.S3) {
  try {
    await s3
      .headObject({
        Bucket: bucket,
        Key: key,
      })
      .promise()
    return true
  } catch (e) {
    return false
  }
}

export async function s3ReadObjectJSON(
  bucket: string,
  key: string,
  s3: AWS.S3
) {
  try {
    const object = await s3
      .getObject({
        Bucket: bucket,
        Key: key,
      })
      .promise()
    return JSON.parse(object!.Body!.toString('utf-8'))
  } catch (e) {
    return undefined
  }
}

export function filetypeToExtension(filetype: string) {
  switch (filetype) {
    case 'manifest':
      return 'manifest'
    case 'metadata':
      return 'metadata'
    case 'image/webp':
      return 'webp'
    case 'image/jpeg':
      return 'jpeg'
    case 'image/png':
      return 'png'
    case 'text/yaml':
      return 'yaml'
    case 'text/json':
      return 'json'
    case 'application/pdf':
      return 'pdf'
    default:
      throw new Error('Bad file extension: ' + filetype)
  }
}

// Hashes come in base64 encoded, we convert them back to hex strings since
// base64 includes slashes. This is largely an aesthetic concern that makes
// browsing the buckets easier online.
export function hashFilename(uuid: string, hash: string, filetype: string) {
  const buffer = Buffer.from(hash, 'base64')
  return (
    '/' +
    uuid +
    '/' +
    buffer.toString('hex') +
    '.' +
    filetypeToExtension(filetype)
  )
}

// This is only for distingushing our internal IDs from UUIDs, not for
// validating UUIDs!
export function isUUIDOrInternalID(s: string) {
  return s.length === 36
}

export function acceptedVersions(event: any, def = ['1.0.0']) {
  return event.headers['acceptedversions'] || event.headers['AcceptedVersions']
    ? JSON.parse(
        event.headers['acceptedversions'] || event.headers['AcceptedVersions']
      )
    : def
}

export async function getForm(
  ddb: AWS.DynamoDB,
  s3: AWS.S3,
  form_table: string,
  form_bucket: string,
  formId: string,
  formVersion: string
) {
  const item = await ddb
    .getItem({
      TableName: form_table,
      Key: {
        PK: { S: 'FORM#' + formId },
        SK: { S: 'VERSION#' + formVersion },
      },
    })
    .promise()
  try {
    const form = formMetadataSchemaStrip.parse(DynamoDB.unmarshall(item.Item))
    function createLink(v: FormManifestFile): FormManifestFileWithLink {
      return {
        sha256: v.sha256,
        filetype: v.filetype,
        filename: v.filename,
        link: s3.getSignedUrl('getObject', {
          Bucket: form_bucket,
          Key: hashFilename(form.formUUID, v.sha256, v.filetype),
          ResponseCacheControl: `private, max-age=31536000, immutable`,
          // 10 minutes is a long time, but it might be needed for slow
          // connections.
          Expires: 600,
        }),
      }
    }
    if (form.manifestHash) {
      const manifestObject = await s3
        .getObject({
          Bucket: form_bucket,
          Key: hashFilename(form.formUUID, form.manifestHash, 'manifest'),
        })
        .promise()
      if (!manifestObject.Body) return bad(manifestObject, 'Empty manifest')
      const body = formManifestSchema.parse(
        JSON.parse(manifestObject.Body.toString('utf-8'))
      )
      const fullManifest: FormManifestWithLinks = {
        'storage-version': '1.0.0',
        root: body.root,
        contents: _.map(body.contents, v => createLink(v)),
      }
      return {
        metadata: form,
        manifest: fullManifest,
        manifestLink: createLink({
          sha256: form.manifestHash,
          filetype: 'manifest',
          filename: 'manifest',
        }),
      }
    } else {
      // The form is empty
      return {
        metadata: form,
        manifest: {
          'storage-version': '1.0.0',
          root: '',
          contents: [],
        },
      }
    }
  } catch (e) {
    return bad([item, e], 'Got bad item')
  }
}

export async function getRecord(
  ddb: AWS.DynamoDB,
  s3: AWS.S3,
  record_table: string,
  record_bucket: string,
  recordId: string
) {
  const item = await ddb
    .getItem({
      TableName: record_table,
      Key: {
        PK: { S: 'RECORD#' + recordId },
        SK: { S: 'VERSION#latest' },
      },
    })
    .promise()
  try {
    const record = recordMetadataSchemaStrip.parse(
      DynamoDB.unmarshall(item.Item)
    )
    function createLink(v: RecordManifestFile): RecordManifestFileWithLink {
      return {
        sha256: v.sha256,
        filetype: v.filetype,
        filename: v.filename,
        link: s3.getSignedUrl('getObject', {
          Bucket: record_bucket,
          Key: hashFilename(record.recordUUID, v.sha256, v.filetype),
          ResponseCacheControl: `private, max-age=31536000, immutable`,
          // 10 minutes is a long time, but it might be needed for slow
          // connections.
          Expires: 600,
        }),
      }
    }
    if (record.manifestHash) {
      const manifestObject = await s3
        .getObject({
          Bucket: record_bucket,
          Key: hashFilename(record.recordUUID, record.manifestHash, 'manifest'),
        })
        .promise()
      if (!manifestObject.Body) return bad(manifestObject, 'Empty manifest')
      const body = recordManifestSchema.parse(
        JSON.parse(manifestObject.Body.toString('utf-8'))
      )
      const fullManifest: RecordManifestWithLinks = {
        'storage-version': '1.0.0',
        root: body.root,
        contents: _.map(body.contents, v => createLink(v)),
      }
      return {
        metadata: record,
        manifest: fullManifest,
        manifestLink: createLink({
          sha256: record.manifestHash,
          filetype: 'manifest',
          filename: 'manifest',
        }),
      }
    } else {
      // The record is empty
      return {
        metadata: record,
        manifest: {
          'storage-version': '1.0.0',
          root: '',
          contents: [],
        },
      }
    }
  } catch (e) {
    return bad([e], 'Got bad item')
  }
}
