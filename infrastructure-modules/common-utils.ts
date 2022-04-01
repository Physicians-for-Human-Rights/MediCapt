import { HumanIDResponse } from 'common-types'

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

export async function machineIdToHumanId(
  uuid: string,
  prefix: string,
  lambda: any
) {
  const payload = JSON.stringify({
    action: 'machineID-to-humanID',
    machineID: uuid,
    suggestedPrefix: prefix,
  })
  const response = await lambda
    .invoke({
      FunctionName: process.env.humanid_lambda,
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
