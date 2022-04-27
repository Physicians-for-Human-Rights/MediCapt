'use strict'

import { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda'
import AWS from 'aws-sdk'
AWS.config.update({
  region: process.env.AWS_REGION,
})

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  console.log('ENVIRONMENT VARIABLES\n' + JSON.stringify(process.env, null, 2))
  console.log('EVENT\n' + JSON.stringify(event, null, 2))
  console.log('CONTEXT\n' + JSON.stringify(context, null, 2))
  return {
    statusCode: 200,
    body: JSON.stringify([process.env, event, context], null, 2),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  }
}
