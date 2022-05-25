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
      record_gsi_id: string
      record_gsi_location: string
      record_gsi_createdby: string
      record_gsi_updatedby: string
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
import {
  RecordMetadata,
  recordMetadataSchemaStrip,
} from 'utils/types/recordMetadata'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    let startKey = undefined as undefined | AWS.DynamoDB.Key
    let filter = [] as QueryFilterForType<RecordMetadata>
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
        ) as QueryFilterForType<RecordMetadata>
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

    if ('recordID' in combinedFilters && 'eq' in combinedFilters.recordID) {
      const results = await simpleDynamoQuery(
        ddb,
        startKey,
        process.env.record_table,
        process.env.record_gsi_id,
        'GPK1',
        'RECORD#' + combinedFilters.recordID.eq,
        'GSK1',
        'VERSION#latest'
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
          process.env.record_table,
          process.env.record_gsi_location,
          'GPK3',
          'LO#' + combinedFilters.locationID.eq
        )
        rawItems = results.Items ? results.Items : []
        lastKey = results.LastEvaluatedKey
      } catch (e) {
        return bad(
          [e, process.env.record_gsi_location],
          'Generic error location'
        )
      }
    } else {
      const results = await simpleDynamoQuery(
        ddb,
        startKey,
        process.env.record_table,
        process.env.record_gsi_date,
        'GPK2',
        'VERSION#latest'
      )
      rawItems = results.Items ? results.Items : []
      lastKey = results.LastEvaluatedKey
    }

    try {
      var items = _.filter(
        _.map(rawItems, e =>
          recordMetadataSchemaStrip.parse(DynamoDB.unmarshall(e))
        ),
        e =>
          ('recordID' in combinedFilters && 'eq' in combinedFilters.recordID
            ? e.recordID === combinedFilters.recordID.eq
            : true) &&
          ('locationID' in combinedFilters && 'eq' in combinedFilters.locationID
            ? e.locationID === combinedFilters.locationID.eq
            : true)
      )
    } catch (e) {
      return bad(
        [
          e,
          rawItems,
          recordMetadataSchemaStrip.parse(DynamoDB.unmarshall(rawItems![0])),
        ],
        'Bad DB data'
      )
    }
    return good({ items: items, nextKey: lastKey })
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
