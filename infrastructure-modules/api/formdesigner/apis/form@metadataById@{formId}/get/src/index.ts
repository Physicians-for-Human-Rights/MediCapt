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
      form_table: string
    }
  }
}

import { good, bad, DynamoDB } from 'common-utils'
import { formMetadataSchemaStrip } from 'utils/types/formMetadata'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    if (event.pathParameters && event.pathParameters.formId) {
      var formId = event.pathParameters.formId
    } else {
      return bad(event.pathParameters, 'Missing event parameters')
    }
    const item = await ddb
      .getItem({
        TableName: process.env.form_table,
        Key: {
          PK: { S: 'FORM#' + formId },
          SK: { S: 'VERSION#latest' },
        },
      })
      .promise()
    try {
      return good({
        metadata: formMetadataSchemaStrip.parse(DynamoDB.unmarshall(item.Item)),
      })
    } catch (e) {
      return bad([item, e], 'Got bad item')
    }
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
