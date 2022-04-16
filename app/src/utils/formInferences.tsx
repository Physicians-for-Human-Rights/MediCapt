import { RecordPath } from 'utils/types/record'
import _ from 'lodash'

// Make inferences about the form so that you can access more abstract values
// like someone's age without needing to specify the exact path to the age field

export default function getFlatRecordValue(
  flatRecord: Record<string, any>,
  valuePath: RecordPath,
  default_: any = null
) {
  if (valuePath === null) return default_
  if (valuePath[0] === 'inferred') {
    switch (valuePath[1]) {
      case 'age-of-majority': {
        // TODO Should this vary by country?
        return 18
      }
      case 'sex': {
        const value = _.find(
          flatRecord,
          (_v, k) =>
            _.includes(k, '.sex.value') ||
            // These two are definitely not equivalent, but some forms may not
            // include both
            _.includes(k, '.gender.value')
        )
        if (typeof value === 'string') {
          return value
        }
        return default_
      }
      case 'age': {
        const value = _.find(flatRecord, (v, k) => _.includes(k, '.age.value'))
        if (typeof value === 'number') {
          return value
        }
        return default_
      }
      default:
        // TODO Error handling
        console.log("Don't know how to compute this inferred value", valuePath)
    }
  }
  const stringPath = _.join(valuePath, '.')
  return stringPath in flatRecord ? flatRecord[stringPath] : default_
}
