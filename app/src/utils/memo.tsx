import _ from 'lodash'
import React from 'react'
import { RenderCommand } from 'utils/formRendering/types'

export function wrapCommandMemo<T extends object>(
  component: React.FunctionComponent<T>
): React.FunctionComponent<T & { command: RenderCommand }> {
  return React.memo(
    component,
    (prev, next) =>
      //@ts-ignore
      next.keepAlive === true ||
      //@ts-ignore
      prev.command === next.command ||
      //@ts-ignore
      _.isEqual(prev.command, next.command)
  )
}

export function wrapMemo<T>(component: T): React.NamedExoticComponent<T> {
  //@ts-ignore
  return React.memo(component, (prev, next) => _.isEqual(prev, next))
}
