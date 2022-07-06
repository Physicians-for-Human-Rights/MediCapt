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
      sharing_table: string
      sharing_gsi_by_date: string
      sharing_gsi_with_id: string
      sharing_gsi_with_date: string
      sharing_gsi_by_record: string
      form_table: string
      form_bucket: string
      record_table: string
      record_bucket: string
    }
  }
}

import { good, bad, DynamoDB, simpleDynamoQuery } from 'common-utils'
import {
  queryFilterSchema,
  QueryFilterForType,
  QueryFilterMatching,
} from 'utils/types/url'
import { Share, shareSchemaStrip } from 'utils/types/share'

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async (
  event,
  context
) => {
  try {
    let startKey = undefined as undefined | AWS.DynamoDB.Key
    let filter = [] as QueryFilterForType<Share>
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
        ) as QueryFilterForType<Share>
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

    if ('shareID' in combinedFilters && 'eq' in combinedFilters.shareID) {
      const results = await simpleDynamoQuery(
        ddb,
        startKey,
        process.env.sharing_table,
        process.env.sharing_gsi_with_id,
        'GPK2',
        'WITH#' + event.requestContext.authorizer.claims.sub,
        'GSK2',
        'SHARE#' + combinedFilters.shareID.eq
      )
      rawItems = results.Items ? results.Items : []
      lastKey = results.LastEvaluatedKey
    } else if (
      'createdByUUID' in combinedFilters &&
      'eq' in combinedFilters.createdByUUID
    ) {
      try {
        const results = await simpleDynamoQuery(
          ddb,
          startKey,
          process.env.sharing_table,
          process.env.sharing_gsi_with_date,
          'GPK3',
          'WITH#' + event.requestContext.authorizer.claims.sub,
          'GPK3',
          'DATE#' + combinedFilters.createdByUUID.eq
        )
        rawItems = results.Items ? results.Items : []
        lastKey = results.LastEvaluatedKey
      } catch (e) {
        return bad(
          [e, process.env.share_gsi_createdby],
          'Generic error createdby'
        )
      }
    } else {
      const results = await simpleDynamoQuery(
        ddb,
        startKey,
        process.env.sharing_table,
        process.env.sharing_gsi_with_date,
        'GPK3',
        'WITH#' + event.requestContext.authorizer.claims.sub
      )
      rawItems = results.Items ? results.Items : []
      lastKey = results.LastEvaluatedKey
    }

    try {
      var items = _.filter(
        _.map(rawItems, e => shareSchemaStrip.parse(DynamoDB.unmarshall(e))),
        e =>
          ('shareID' in combinedFilters && 'eq' in combinedFilters.shareID
            ? e.shareID === combinedFilters.shareID.eq
            : true) &&
          ('locationID' in combinedFilters && 'eq' in combinedFilters.locationID
            ? e.locationID === combinedFilters.locationID.eq
            : true) &&
          ('createdByUUID' in combinedFilters &&
          'eq' in combinedFilters.createdByUUID
            ? e.createdByUUID === combinedFilters.createdByUUID.eq
            : true)
      )
    } catch (e) {
      return bad([e], 'Bad DB data')
    }
    return good({ items: items, nextKey: lastKey })
  } catch (e) {
    return bad(e, 'Generic error')
  }
}
