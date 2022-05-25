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
      form_gsi_id: string
      form_gsi_date: string
      form_gsi_language: string
      form_gsi_country: string
      form_gsi_location: string
    }
  }
}

import { good, bad, DynamoDB, simpleDynamoQuery } from 'common-utils'
import {
  queryFilterSchema,
  QueryFilterForType,
  querySortSchema,
  QueryFilterMatching,
  QuerySort,
} from 'utils/types/url'
import { FormMetadata, formMetadataSchemaStrip } from 'utils/types/formMetadata'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    let startKey = undefined as undefined | AWS.DynamoDB.Key
    let filter = [] as QueryFilterForType<FormMetadata>
    if (
      event.queryStringParameters &&
      'nextKey' in event.queryStringParameters &&
      event.queryStringParameters['nextKey']
    ) {
      try {
        startKey = JSON.parse(event.queryStringParameters['nextKey'])
      } catch (e) {
        return bad(e, 'Bad next key')
      }
    }
    if (
      event.queryStringParameters &&
      'filter' in event.queryStringParameters &&
      event.queryStringParameters['filter']
    ) {
      try {
        filter = queryFilterSchema.parse(
          JSON.parse(event.queryStringParameters['filter'])
        ) as QueryFilterForType<FormMetadata>
      } catch (e) {
        return bad(e, 'Bad query filter')
      }
    }

    const combinedFilters: Record<string, QueryFilterMatching> = _.merge.apply(
      null,
      // @ts-ignore
      filter
    )
    let rawItems: AWS.DynamoDB.ItemList = []
    let lastKey: undefined | AWS.DynamoDB.Key = undefined

    if ('formID' in combinedFilters && 'eq' in combinedFilters.formID) {
      const results = await simpleDynamoQuery(
        ddb,
        startKey,
        process.env.form_table,
        process.env.form_gsi_id,
        'GPK1',
        'FORM#' + combinedFilters.formID.eq,
        'GSK1',
        'VERSION#latest'
      )
      rawItems = results.Items ? results.Items : []
      lastKey = results.LastEvaluatedKey
    } else if (
      'country' in combinedFilters &&
      'eq' in combinedFilters.country
    ) {
      const results = await simpleDynamoQuery(
        ddb,
        startKey,
        process.env.form_table,
        process.env.form_gsi_country,
        'GPK4',
        'CA#' + combinedFilters.country.eq
      )
      rawItems = results.Items ? results.Items : []
      lastKey = results.LastEvaluatedKey
    } else if (
      'language' in combinedFilters &&
      'eq' in combinedFilters.language
    ) {
      const results = await simpleDynamoQuery(
        ddb,
        startKey,
        process.env.form_table,
        process.env.form_gsi_language,
        'GPK3',
        'LA#' + combinedFilters.language.eq
      )
      rawItems = results.Items ? results.Items : []
      lastKey = results.LastEvaluatedKey
    } else if (
      'locationID' in combinedFilters &&
      'eq' in combinedFilters.locationID
    ) {
      try {
        const results = await simpleDynamoQuery(
          ddb,
          startKey,
          process.env.form_table,
          process.env.form_gsi_location,
          'GPK5',
          'LO#' + combinedFilters.locationID.eq
        )
        rawItems = results.Items ? results.Items : []
        lastKey = results.LastEvaluatedKey
      } catch (e) {
        return bad(e, 'Generic error LID')
      }
    } else {
      const results = await simpleDynamoQuery(
        ddb,
        startKey,
        process.env.form_table,
        process.env.form_gsi_date,
        'GPK2',
        'VERSION#latest'
      )
      rawItems = results.Items ? results.Items : []
      lastKey = results.LastEvaluatedKey
    }

    try {
      var items = _.filter(
        _.map(rawItems, e =>
          formMetadataSchemaStrip.parse(DynamoDB.unmarshall(e))
        ),
        e =>
          ('formID' in combinedFilters && 'eq' in combinedFilters.formID
            ? e.formID === combinedFilters.formID.eq
            : true) &&
          ('country' in combinedFilters && 'eq' in combinedFilters.country
            ? e.country === combinedFilters.country.eq
            : true) &&
          ('language' in combinedFilters && 'eq' in combinedFilters.language
            ? e.language === combinedFilters.language.eq
            : true) &&
          ('locationID' in combinedFilters && 'eq' in combinedFilters.locationID
            ? e.locationID === combinedFilters.locationID.eq
            : true) &&
          ('enabled' in combinedFilters && 'eq' in combinedFilters.enabled
            ? e.enabled === (combinedFilters.enabled.eq === 'enabled')
            : true)
      )
    } catch (e) {
      return bad(
        [
          e,
          rawItems,
          formMetadataSchemaStrip.parse(DynamoDB.unmarshall(rawItems![0])),
        ],
        'Bad DB data'
      )
    }
    return good({ items: items, nextKey: lastKey })
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
