const region = 'us-east-1'
const endpoint = 'http://localhost:4566'

import { v4 as uuidv4 } from 'uuid'
import * as AWS from 'aws-sdk'

AWS.config.update({
  region,
  accessKeyId: 'test',
  secretAccessKey: 'test',
  logger: console,
})

var lambda = new AWS.Lambda({
  endpoint,
  apiVersion: '2015-03-31',
  logger: console,
})

describe('storage/humanID service', () => {
  describe('Creating an ID', () => {
    it('Should return a short ID', async () => {
      const mID = uuidv4()
      const action: HumanIDAction = {
        action: 'machineID-to-humanID',
        machineID: mID,
        suggestedPrefix: 'WF',
      }
      const result = await lambda
        .invoke({
          FunctionName: 'local-medicapt-humanid',
          InvocationType: 'RequestResponse',
          LogType: 'Tail',
          Payload: JSON.stringify(action),
        })
        .promise()
      expect(result).toHaveProperty('Payload')
      const response: HumanIDResponse = JSON.parse(result.Payload.toString())
      expect(response).toHaveProperty('humanID')
      expect(response).toHaveProperty('machineID')
      if ('machineID' in response) {
        expect(response.machineID).toBe(mID)
        expect(response.humanID).not.toBe(mID)
      }
    })
  })
})
