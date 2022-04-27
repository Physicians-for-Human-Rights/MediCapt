import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda'
import AWS from 'aws-sdk'
AWS.config.update({
  region: process.env.AWS_REGION,
})
const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' })
var lambda = new AWS.Lambda({
  apiVersion: '2015-03-31',
  region: process.env.AWS_REGION,
})

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      humanid_lambda: string
      form_table: string
    }
  }
}

import { good, bad, machineIdToHumanId, DynamoDB } from 'common-utils'
import {
  formMetadataSchemaByUser,
  FormMetadataByUser,
  FormMetadata,
  formSchemaDynamoLatest,
  FormDynamoLatestType,
  formSchemaDynamoVersion,
  FormDynamoVersionType,
} from 'utils/types/formMetadata'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    try {
      var formCreation = formMetadataSchemaByUser.parse(
        JSON.parse(event.body!)
      ) as FormMetadataByUser
    } catch (e) {
      return bad(e, 'Bad input form')
    }

    const formUUID = uuidv4()
    const ids = await machineIdToHumanId(
      formUUID,
      'MF',
      lambda,
      process.env.humanid_lambda
    )
    const form: FormMetadata = {
      ...formCreation,
      version: '1',
      createdDate: new Date(),
      createdByUUID: event.requestContext.authorizer.claims.sub,
      enabled: false,
      formUUID: ids.machineID,
      formID: ids.humanID,
      lastChangedByUUID: event.requestContext.authorizer.claims.sub,
      lastChangedDate: new Date(),
      manifestHash: '',
      manifestMD5: '',
    }
    const formDynamoLatest: FormDynamoLatestType = {
      ...form,
      PK: 'FORM#' + form.formUUID,
      SK: 'VERSION#latest',
      GPK1: 'FORM#' + form.formID,
      GSK1: 'VERSION#latest',
      GPK2: 'VERSION#latest',
      GSK2: 'DATE#' + form.lastChangedDate.toISOString(),
      GPK3: 'LA#' + form.language,
      GSK3: 'DATE#' + form.lastChangedDate.toISOString(),
      GPK4: 'CA#' + form.country,
      GSK4: 'DATE#' + form.lastChangedDate.toISOString(),
      GPK5: 'LO#' + form.locationID,
      GSK5: 'DATE#' + form.lastChangedDate.toISOString(),
    }
    const formDynamoV1: FormDynamoVersionType = {
      ...form,
      PK: 'FORM#' + form.formUUID,
      SK: 'VERSION#1',
    }
    try {
      formSchemaDynamoLatest.parse(formDynamoLatest)
      formSchemaDynamoVersion.parse(formDynamoV1)
    } catch (e) {
      return bad(e, 'Bad output form')
    }
    await ddb
      .putItem({
        TableName: process.env.form_table,
        Item: DynamoDB.marshall(formDynamoV1),
      })
      .promise()
    await ddb
      .putItem({
        TableName: process.env.form_table,
        Item: DynamoDB.marshall(formDynamoLatest),
      })
      .promise()
    return good(form)
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
