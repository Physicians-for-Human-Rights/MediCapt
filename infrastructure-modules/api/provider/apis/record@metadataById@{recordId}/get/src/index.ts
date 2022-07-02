import _ from 'lodash'
import { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda'
import AWS from 'aws-sdk'
AWS.config.update({
  region: process.env.AWS_REGION,
})
const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' })

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      record_table: string
    }
  }
}

import { good, bad, DynamoDB } from 'common-utils'
import { recordMetadataSchemaStrip } from 'utils/types/recordMetadata'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    if (event.pathParameters && event.pathParameters.recordId) {
      var recordId = event.pathParameters.recordId
    } else {
      return bad(event.pathParameters, 'Missing event parameters')
    }
    const item = await ddb
      .getItem({
        TableName: process.env.record_table,
        Key: {
          PK: { S: 'RECORD#' + recordId },
          SK: { S: 'VERSION#latest' },
        },
      })
      .promise()
    try {
      return good({
        metadata: recordMetadataSchemaStrip.parse(
          DynamoDB.unmarshall(item.Item)
        ),
      })
    } catch (e) {
      return bad([item, e], 'Got bad item')
    }
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
