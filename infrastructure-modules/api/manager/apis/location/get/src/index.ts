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
      location_table: string
      location_gsi_id: string
      location_gsi_date: string
      location_gsi_language: string
      location_gsi_country: string
      location_gsi_entity: string
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
  LocationType,
  locationSchema,
  locationSchemaStrip,
} from 'utils/types/location'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    let startKey = undefined as undefined | AWS.DynamoDB.Key
    let filter = [] as QueryFilterForType<LocationType>
    let sort = [] as QuerySort
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
        ) as QueryFilterForType<LocationType>
      } catch (e) {
        return bad(e, 'Bad query filter')
      }
    }
    if (
      event.queryStringParameters &&
      'sort' in event.queryStringParameters &&
      event.queryStringParameters['sort']
    ) {
      try {
        sort = querySortSchema.parse(
          JSON.parse(event.queryStringParameters['sort'])
        ) as QuerySort
      } catch (e) {
        return bad(e, 'Bad query sort')
      }
    }
    let combinedFilters: Record<string, QueryFilterMatching> = _.merge.apply(
      null,
      // @ts-ignore
      filter
    )
    let rawItems: AWS.DynamoDB.ItemList = []
    let lastKey: undefined | AWS.DynamoDB.Key = undefined
    if (_.isEmpty(filter)) {
      const results = await simpleDynamoQuery(
        ddb,
        startKey,
        process.env.location_table,
        process.env.location_gsi_date,
        'GPK2',
        'VERSION#latest'
      )
      rawItems = results.Items ? results.Items : []
      lastKey = results.LastEvaluatedKey
    } else if (
      'locationID' in combinedFilters &&
      'eq' in combinedFilters.locationID
    ) {
      const results = await simpleDynamoQuery(
        ddb,
        startKey,
        process.env.location_table,
        process.env.location_gsi_id,
        'GPK1',
        'LOCATION#' + combinedFilters.locationID.eq,
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
        process.env.location_table,
        process.env.location_gsi_country,
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
        process.env.location_table,
        process.env.location_gsi_language,
        'GPK3',
        'LA#' + combinedFilters.language.eq
      )
      rawItems = results.Items ? results.Items : []
      lastKey = results.LastEvaluatedKey
    } else if (
      'entityType' in combinedFilters &&
      'eq' in combinedFilters.entityType
    ) {
      const results = await simpleDynamoQuery(
        ddb,
        startKey,
        process.env.location_table,
        process.env.location_gsi_entity,
        'GPK5',
        'ET#' + combinedFilters.entityType.eq
      )
      rawItems = results.Items ? results.Items : []
      lastKey = results.LastEvaluatedKey
    } else {
      return bad(
        combinedFilters,
        'Do not know how to handle this combination of filters'
      )
    }
    try {
      var items = _.filter(
        _.map(rawItems, e => locationSchemaStrip.parse(DynamoDB.unmarshall(e))),
        e =>
          ('locationID' in combinedFilters && 'eq' in combinedFilters.locationID
            ? e.locationID === combinedFilters.locationID.eq
            : true) &&
          ('country' in combinedFilters && 'eq' in combinedFilters.country
            ? e.country === combinedFilters.country.eq
            : true) &&
          ('language' in combinedFilters && 'eq' in combinedFilters.language
            ? e.language === combinedFilters.language.eq
            : true) &&
          ('entityType' in combinedFilters && 'eq' in combinedFilters.entityType
            ? e.entityType === combinedFilters.entityType.eq
            : true)
      )
    } catch (e) {
      return bad(
        [
          e,
          rawItems,
          locationSchemaStrip.parse(DynamoDB.unmarshall(rawItems![0])),
        ],
        'Bad DB data'
      )
    }
    return good({ items: items, nextKey: lastKey })
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
