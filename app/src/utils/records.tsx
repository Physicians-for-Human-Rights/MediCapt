import {
  RecordValuePath,
  RecordValueByType,
  RecordValue,
  FlatRecord,
  RecordType,
  RecordParts,
  RecordPart,
} from 'utils/types/record'
import _ from 'lodash'

export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'repeat-list'
): RecordValueByType['repeat-list'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'list-with-parts'
): RecordValueByType['list-with-parts'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'bool'
): RecordValueByType['bool'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'date'
): RecordValueByType['date'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'date-time'
): RecordValueByType['date-time'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'number'
): RecordValueByType['number'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'list'
): RecordValueByType['list'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'list-with-labels'
): RecordValueByType['list-with-labels'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'list-multiple'
): RecordValueByType['list-multiple'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'list-with-labels-multiple'
): RecordValueByType['list-with-labels-multiple'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'text'
): RecordValueByType['text'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'long-text'
): RecordValueByType['long-text'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'email'
): RecordValueByType['email'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'address'
): RecordValueByType['address'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'phone-number'
): RecordValueByType['phone-number'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'gender'
): RecordValueByType['gender'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'sex'
): RecordValueByType['sex'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'signature'
): RecordValueByType['signature'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'photo'
): RecordValueByType['photo'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType: 'body-image'
): RecordValueByType['body-image'] | undefined
export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath
): RecordValue | undefined

export function getFlatRecordValue(
  flatRecord: FlatRecord,
  valuePath: RecordValuePath,
  expectedType?: keyof RecordValueByType
) {
  function restrictType(value?: RecordValue) {
    if (!value?.type || !expectedType || value?.type === expectedType)
      return value
    else return undefined
  }

  if (!valuePath) return undefined

  if (valuePath[0] === 'inferred') {
    switch (valuePath[1]) {
      case 'age-of-majority': {
        // TODO Should this vary by country?
        return restrictType({
          type: 'number',
          value: '18',
        } as RecordValue)
      }
      case 'sex': {
        const sexEntries = _.filter(flatRecord, (v, _k) => v.type === 'sex')
        if (sexEntries.length === 1) return restrictType(sexEntries[0])
        else return undefined
      }
      case 'gender': {
        const genderEntries = _.filter(
          flatRecord,
          (v, _k) => v.type === 'gender'
        )
        if (genderEntries.length === 1) return restrictType(genderEntries[0])
        else return undefined
      }
      case 'age': {
        const recordData = _.find(
          flatRecord,
          (v, k) => _.includes(k, 'age') && v.type === 'number'
        )
        return restrictType(recordData)
      }
      default:
        // TODO Error handling
        console.log("Don't know how to compute this inferred value", valuePath)
        return undefined
    }
  }
  const stringPath = _.join(valuePath, '.')
  return restrictType(flatRecord[stringPath])
}

export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'repeat-list'
): RecordValueByType['repeat-list'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'list-with-parts'
): RecordValueByType['list-with-parts'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'bool'
): RecordValueByType['bool'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'date'
): RecordValueByType['date'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'date-time'
): RecordValueByType['date-time'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'number'
): RecordValueByType['number'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'list'
): RecordValueByType['list'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'list-with-labels'
): RecordValueByType['list-with-labels'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'list-multiple'
): RecordValueByType['list-multiple'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'list-with-labels-multiple'
): RecordValueByType['list-with-labels-multiple'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'text'
): RecordValueByType['text'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'long-text'
): RecordValueByType['long-text'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'email'
): RecordValueByType['email'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'address'
): RecordValueByType['address'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'phone-number'
): RecordValueByType['phone-number'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'gender'
): RecordValueByType['gender'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'sex'
): RecordValueByType['sex'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'signature'
): RecordValueByType['signature'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'photo'
): RecordValueByType['photo'] | undefined
export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: 'body-image'
): RecordValueByType['body-image'] | undefined

export function restrictRecordValueType(
  recordValue: RecordValue | undefined,
  expectedType: keyof RecordValueByType
) {
  if (recordValue?.type === expectedType) return recordValue
  else return undefined
}

export function flatRecordToRecordType(flatRecord: FlatRecord): RecordType {
  const record: RecordType = { sections: {} }
  _.map(flatRecord, (v, p) => _.set(record, p, v))
  return record
}

export function recordTypeToFlatRecord(record: RecordType): FlatRecord {
  const flatRecord: FlatRecord = {}

  function flattenParts(parts: RecordParts, path: RecordValuePath) {
    Object.keys(parts).forEach(partName => {
      const part = parts[partName]

      switch (part.type) {
        case 'repeat-list': {
          const { repeat, ...terminal } = part
          flatRecord[_.join(path.concat(partName))] = terminal
          if (repeat) flattenParts(repeat, path.concat(partName, 'repeat'))
          break
        }
        case 'list-with-parts': {
          const { parts, 'list-parts': listParts, ...terminal } = part
          flatRecord[_.join(path.concat(partName))] = terminal
          if (listParts)
            flattenParts(listParts, path.concat(partName, 'list-parts'))
          if (parts) flattenParts(parts, path.concat(partName, 'parts'))
          break
        }
        default: {
          const { parts, ...terminal } = part as RecordPart
          flatRecord[_.join(path.concat(partName))] = terminal
          if (parts) flattenParts(parts, path.concat(partName, 'parts'))
        }
      }
    })
  }

  Object.keys(record.sections).forEach(sectionName => {
    const parts = record.sections[sectionName].parts
    flattenParts(parts, ['sections', sectionName, 'parts'])
  })

  return flatRecord
}
