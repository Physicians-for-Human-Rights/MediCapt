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
  it('Should return a new unique short ID', async () => {
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
  it('Retrieve a created ID', async () => {
    const mID = uuidv4()
    const action: HumanIDAction = {
      action: 'machineID-to-humanID',
      machineID: mID,
      suggestedPrefix: 'WF',
    }
    const result1 = await lambda
      .invoke({
        FunctionName: 'local-medicapt-humanid',
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify(action),
      })
      .promise()
    const result2 = await lambda
      .invoke({
        FunctionName: 'local-medicapt-humanid',
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify(action),
      })
      .promise()
    expect(result1).toHaveProperty('Payload')
    expect(result2).toHaveProperty('Payload')
    const response1: HumanIDResponse = JSON.parse(result1.Payload.toString())
    const response2: HumanIDResponse = JSON.parse(result2.Payload.toString())
    expect(response1).toHaveProperty('humanID')
    expect(response1).toHaveProperty('machineID')
    expect(response2).toHaveProperty('humanID')
    expect(response2).toHaveProperty('machineID')
    if ('machineID' in response1 && 'machineID' in response2) {
      expect(response1.humanID).toBe(response2.humanID)
    }
  })
  it('Retrieve a created ID', async () => {
    const mID = uuidv4()
    const action: HumanIDAction = {
      action: 'machineID-to-humanID',
      machineID: mID,
      suggestedPrefix: 'WF',
    }
    const result1 = await lambda
      .invoke({
        FunctionName: 'local-medicapt-humanid',
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify(action),
      })
      .promise()
    const result2 = await lambda
      .invoke({
        FunctionName: 'local-medicapt-humanid',
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify(action),
      })
      .promise()
    expect(result1).toHaveProperty('Payload')
    expect(result2).toHaveProperty('Payload')
    const response1: HumanIDResponse = JSON.parse(result1.Payload.toString())
    const response2: HumanIDResponse = JSON.parse(result2.Payload.toString())
    expect(response1).toHaveProperty('humanID')
    expect(response1).toHaveProperty('machineID')
    expect(response2).toHaveProperty('humanID')
    expect(response2).toHaveProperty('machineID')
    if ('machineID' in response1 && 'machineID' in response2) {
      expect(response1.humanID).toBe(response2.humanID)
      expect(response1.machineID).toBe(response2.machineID)
    }
  })
  it('Mapping a human ID back to a machine ID', async () => {
    const mID = uuidv4()
    const action1: HumanIDAction = {
      action: 'machineID-to-humanID',
      machineID: mID,
      suggestedPrefix: 'WF',
    }
    const result1 = await lambda
      .invoke({
        FunctionName: 'local-medicapt-humanid',
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify(action1),
      })
      .promise()
    expect(result1).toHaveProperty('Payload')
    const response1: HumanIDResponse = JSON.parse(result1.Payload.toString())
    expect(response1).toHaveProperty('humanID')
    expect(response1).toHaveProperty('machineID')
    //
    const action2: HumanIDAction = {
      action: 'humanID-to-machineID',
      // @ts-ignore
      humanID: response1.humanID,
    }
    const result2 = await lambda
      .invoke({
        FunctionName: 'local-medicapt-humanid',
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify(action2),
      })
      .promise()
    expect(result2).toHaveProperty('Payload')
    const response2: HumanIDResponse = JSON.parse(result2.Payload.toString())
    expect(response2).toHaveProperty('humanID')
    expect(response2).toHaveProperty('machineID')
    if ('machineID' in response1 && 'machineID' in response2) {
      expect(response1.humanID).toBe(response2.humanID)
      expect(response1.machineID).toBe(response2.machineID)
    }
  })
})
