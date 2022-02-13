import _ from 'lodash'

// Make inferences about the form so that you can access more abstract values
// like someone's age without needing to specify the exact path to the age field

export default function formGetPath(
  formPaths: Record<string, any>,
  valuePath: string,
  default_: any = null
) {
  if (_.startsWith(valuePath, 'inferred.')) {
    switch (valuePath) {
      case 'inferred.sex': {
        const value = _.find(
          formPaths,
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
      case 'inferred.age-of-majority': {
        // TODO Should this vary by country?
        return 18
      }
      case 'inferred.age': {
        const value = _.find(formPaths, (v, k) => _.includes(k, '.age.value'))
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
  return _.has(formPaths, valuePath) ? formPaths[valuePath] : default_
}
