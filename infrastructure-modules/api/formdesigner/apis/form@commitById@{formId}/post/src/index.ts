import _ from 'lodash'
import { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda'
import AWS from 'aws-sdk'
AWS.config.update({
  region: process.env.AWS_REGION,
})
const s3 = new AWS.S3({ signatureVersion: 'v4', apiVersion: '2006-03-01' })
const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' })

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      humanid_lambda: string
      form_table: string
    }
  }
}

import {
  good,
  bad,
  DynamoDB,
  zodDynamoUpdateExpression,
  zodDynamoAttributeValues,
  zodDynamoAttributeNames,
  s3ObjectExists,
  s3ReadObjectJSON,
  hashFilename,
} from 'common-utils'
import {
  FormDynamoLatestToUpdateType,
  FormDynamoVersionType,
  FormDynamoUpdateType,
  FormMetadata,
  formMetadataSchema,
  formMetadataSchemaByUser,
  formSchemaDynamoVersion,
  formMetadataSchemaStrip,
  formSchemaDynamoLatestToUpdate,
  formManifestSchema,
} from 'utils/types/formMetadata'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    if (event.pathParameters && event.pathParameters.formId) {
      var formId = event.pathParameters.formId
    } else {
      return bad(event.pathParameters, 'Missing formId parameter')
    }
    try {
      var form = formMetadataSchema.parse(
        JSON.parse(event.body!)
      ) as FormMetadata
    } catch (e) {
      return bad(e, 'Bad input form')
    }

    // Get the existing entry, validate that it exists
    try {
      var item = await ddb
        .getItem({
          TableName: process.env.form_table,
          Key: {
            PK: { S: 'FORM#' + formId },
            SK: { S: 'VERSION#latest' },
          },
        })
        .promise()
    } catch (e) {
      return bad(e, 'No form exists to update')
    }
    try {
      var existingForm = formMetadataSchemaStrip.parse(
        DynamoDB.unmarshall(item.Item)
      )
    } catch (e) {
      return bad(e, 'Bad form data')
    }

    // Verify that the new manifest is well-formed
    try {
      var newManifest = formManifestSchema.parse(
        await s3ReadObjectJSON(
          process.env.form_bucket,
          hashFilename(formId, form.manifestHash, 'manifest'),
          s3
        )
      )
    } catch (e) {
      return bad(e, 'You did not upload a new manifest, or uploaded a bad one')
    }
    {
      if (newManifest.root) {
        const newRootEntry = _.find(
          newManifest.contents,
          e => e.sha256 === newManifest.root
        )
        if (!newRootEntry) {
          return bad([], 'If you have a root, it must exist')
        }
      }
    }

    // Check that all of the new files we promised to upload are actually there
    let hashesToCheck
    if (existingForm.manifestHash) {
      const oldManifest = formManifestSchema.parse(
        await s3ReadObjectJSON(
          process.env.form_bucket,
          hashFilename(
            existingForm.formUUID,
            existingForm.manifestHash,
            'manifest'
          ),
          s3
        )
      )
      const oldHashes = _.map(oldManifest.contents, v => v.sha256)
      const newHashes = _.map(newManifest.contents, v => v.sha256)
      hashesToCheck = _.difference(newHashes, oldHashes)
    } else {
      hashesToCheck = _.map(newManifest.contents, v => v.sha256)
    }

    for (const hash of hashesToCheck) {
      const entry = _.find(newManifest.contents, e => e.sha256 === hash)
      if (!entry)
        return bad(
          [hash, hashesToCheck, newManifest],
          'Hash missing from manifest'
        )
      if (
        !(await s3ObjectExists(
          process.env.form_bucket,
          hashFilename(existingForm.formUUID, entry.sha256, entry.filetype),
          s3
        ))
      )
        return bad(entry, 'Required file not uploaded')
    }

    // We checked the manifest and metadata are well-formed, that the root is
    // valid and exists, that the metadata table only refers to files that have
    // been uploaded. Time to commit the update.

    const userUpdate = formMetadataSchemaByUser.strip().parse(form)
    const now = new Date()
    const update: FormDynamoUpdateType = {
      ...userUpdate,
      lastChangedByUUID: event.requestContext.authorizer.claims.sub,
      lastChangedDate: now,
      version: _.toString(_.toNumber(form.version) + 1),
    }
    let updateLatest: FormDynamoLatestToUpdateType = {
      ...update,
      GSK2: 'DATE#' + now.toISOString(),
      GPK3: 'LA#' + update.language,
      GSK3: 'DATE#' + now.toISOString(),
      GPK4: 'CA#' + update.country,
      GSK4: 'DATE#' + now.toISOString(),
      GPK5: 'LO#' + update.locationID,
      GSK5: 'DATE#' + now.toISOString(),
      GPK6: (update.enabled ? 'Y#' : 'N#') + 'LO#' + update.locationID,
      GSK6: 'PRIORITY#' + update.priority + '#DATE#' + now.toISOString(),
    }

    // Update latest, verifying that the version hasn't changed.
    try {
      var response = await ddb
        .updateItem({
          TableName: process.env.form_table,
          Key: {
            PK: { S: 'FORM#' + formId },
            SK: { S: 'VERSION#latest' },
          },
          ReturnValues: 'ALL_NEW',
          UpdateExpression: zodDynamoUpdateExpression(
            formSchemaDynamoLatestToUpdate
          ),
          ExpressionAttributeNames: zodDynamoAttributeNames(
            formSchemaDynamoLatestToUpdate
          ),
          ExpressionAttributeValues: {
            ...zodDynamoAttributeValues(
              formSchemaDynamoLatestToUpdate,
              updateLatest
            ),
            ':oldVersion': { S: form.version },
          },
          ConditionExpression: '#version = :oldVersion',
        })
        .promise()
    } catch (e) {
      return bad([], 'Form is out of date or does not exist')
    }
    try {
      const newForm = formMetadataSchemaStrip.parse(
        DynamoDB.unmarshall(_.mapValues(response.Attributes))
      )

      // Insert the versioned form for logging purposes
      const formDynamoNextVersion: FormDynamoVersionType = formSchemaDynamoVersion.parse(
        {
          ...newForm,
          PK: 'FORM#' + newForm.formUUID,
          SK: 'VERSION#' + newForm.version,
        }
      )
      await ddb
        .putItem({
          TableName: process.env.form_table,
          Item: DynamoDB.marshall(formDynamoNextVersion),
        })
        .promise()

      return good({ form: newForm, hashesToCheck })
    } catch (e) {
      return bad(e, 'Unknown error')
    }
  } catch (e) {
    return bad(
      [
        e,
        zodDynamoUpdateExpression(formSchemaDynamoLatestToUpdate),
        zodDynamoAttributeNames(formSchemaDynamoLatestToUpdate),
      ],
      'Generic error'
    )
  }
}
