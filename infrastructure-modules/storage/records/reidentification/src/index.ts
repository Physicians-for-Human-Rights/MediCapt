import { v4 as uuidv4 } from 'uuid'

import { Handler, S3Event } from 'aws-lambda'
import AWS from 'aws-sdk'
AWS.config.update({
  region: process.env.AWS_REGION,
})
var s3 = new AWS.S3({ apiVersion: '2006-03-01' })

/*
  We receive a notification from the records S3 bucket that a new record has
  been added. Specifcally this happens for every `form.yaml` file. We tag the
  form.yaml file in S3 with reid=<uuid>, where the uuid is a reidentification
  token we randomly generate. Then we place that UUID into the reidentification
  S3 bucket as a file /<recordUUID> which contains the generated uuid.

  Researcher endpoints always automatically redact PII/PHI unless they are given
  this secret record-specific reidentification token. This is meant to be a
  breakglass mechanism, not a common operation.
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      reidentificationBucketId: string
    }
  }
}

export const handler: Handler<S3Event, void> = async (
  event,
  context,
  callback
) => {
  for (const record of event.Records) {
    const reidUUID = uuidv4()
    await s3
      .putObjectTagging({
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key,
        Tagging: {
          TagSet: [
            {
              Key: 'reid',
              Value: reidUUID,
            },
          ],
        },
      })
      .promise()
    await s3
      .putObject({
        Body: reidUUID,
        Bucket: process.env.reidentificationBucketId,
        Key: record.s3.object.key,
        ServerSideEncryption: 'aws:kms',
      })
      .promise()
  }

  callback(null, {} as never)
}
