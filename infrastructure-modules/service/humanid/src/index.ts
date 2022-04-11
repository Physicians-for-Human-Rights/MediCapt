import crypto from 'crypto'
import filter from 'lodash/filter.js'
import isEmpty from 'lodash/isEmpty'
import includes from 'lodash/includes'
import { HumanIDResponse, HumanIDAction } from 'services/human-id'

import { Handler } from 'aws-lambda'
import AWS from 'aws-sdk'
AWS.config.update({
  region: process.env.AWS_REGION,
})
var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' })

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      humanid_table_name: string
    }
  }
}

const alphabet = '134789ABCDEFGHJKLMNOPQRSTUWXYZ'

function generate_humanid_of_size(prefix: string, n: number) {
  let output = '' + prefix + n
  for (let i = 0; i < n * 3 - 1; i++) {
    if (i % 3 === 0) {
      output += '-'
    }
    output += alphabet[crypto.randomInt(0, 30)]
  }
  const c = filter(
    crypto
      .createHash('md5')
      .update(output)
      .digest('hex')
      .toUpperCase(),
    d => includes(alphabet, d)
  )
  if (isEmpty(c)) {
    console.log('Generated md5 without a single good digit', output, c)
    throw 'Generated md5 without a single good digit'
  }
  return output + c[0]
}

async function create_humanid_of_size(
  prefix: string,
  n: number,
  machineId: string
): Promise<string | null> {
  const humanId = generate_humanid_of_size(prefix, n)
  const ret = await dynamodb
    .transactWriteItems({
      TransactItems: [
        {
          Put: {
            Item: {
              id1: {
                S: humanId,
              },
              id2: {
                S: machineId,
              },
            },
            TableName: process.env.humanid_table_name,
            ConditionExpression: 'attribute_not_exists(id1)',
            ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
          },
        },
        {
          Put: {
            Item: {
              id1: {
                S: machineId,
              },
              id2: {
                S: humanId,
              },
            },
            TableName: process.env.humanid_table_name,
            ConditionExpression: 'attribute_not_exists(id1)',
            ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
          },
        },
      ],
    })
    .promise()
  if (ret.$response.error) {
    console.error('dynamo', ret)
    throw ret
    return null
  } else {
    return humanId
  }
}

let cacheTable: Record<string, number> = {}

export const handler: Handler<HumanIDAction, HumanIDResponse> = async event => {
  switch (event.action) {
    case 'machineID-to-humanID': {
      const { machineID, suggestedPrefix } = event
      if (machineID === undefined || suggestedPrefix === undefined)
        throw new Error('Malformed action')
      const data = await dynamodb
        .getItem({
          TableName: process.env.humanid_table_name,
          Key: {
            id1: { S: machineID },
          },
        })
        .promise()
      if (data.Item && data.Item.id2 && data.Item.id2.S) {
        return { machineID, humanID: data.Item.id2.S }
      } else {
        let data
        for (let n = 3; n < 6; n++) {
          if (
            !cacheTable[suggestedPrefix] ||
            cacheTable[suggestedPrefix] <= n
          ) {
            for (let retry = 0; retry < 2; retry++) {
              data = await create_humanid_of_size(suggestedPrefix, n, machineID)
              if (data) {
                cacheTable[suggestedPrefix] = n
                return { machineID, humanID: data }
              }
            }
          }
        }
        throw new Error('Failed to generate a humanID' + JSON.stringify(data))
      }
    }
    case 'humanID-to-machineID': {
      const { humanID } = event
      if (humanID === undefined) {
        throw new Error('Malformed action')
      }
      // Look up the humanID
      const data = await dynamodb
        .getItem({
          TableName: process.env.humanid_table_name,
          Key: {
            id1: { S: humanID },
          },
        })
        .promise()
      if (data.Item && data.Item.id2 && data.Item.id2.S) {
        return { humanID, machineID: data.Item.id2.S }
      } else {
        return { failure: 'NOT_FOUND' }
      }
    }
    default:
      throw new Error('Not a supported action')
  }
}

export default handler
