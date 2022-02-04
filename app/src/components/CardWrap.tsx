import React from 'react'
import { Card } from 'react-native-elements'
import _ from 'lodash'

/* Wraps every collection of elements in a Form. Can be nested. Only renders the
 * contents if the form has updated. */

function CardWrap({
  index,
  title,
  description,
  inner,
  subparts,
  changedPaths,
  formPath,
  keepAlive,
  rawDescription,
}) {
  return (
    <Card key={index}>
      <Card.Title>{title}</Card.Title>
      {description}
      {inner}
      {subparts}
    </Card>
  )
}

const RerenderFieldAsNecessary = React.memo(
  CardWrap,
  (prevProps, nextProps) => {
    return (
      prevProps.title === nextProps.title &&
      prevProps.formPath === nextProps.formPath &&
      prevProps.rawDescription === nextProps.rawDescription &&
      !_.some(nextProps.changedPaths, vp =>
        vp.startsWith(nextProps.formPath)
      ) &&
      !_.some(nextProps.keepAlive, vp => vp.startsWith(nextProps.formPath))
    )
  }
)

export default RerenderFieldAsNecessary
