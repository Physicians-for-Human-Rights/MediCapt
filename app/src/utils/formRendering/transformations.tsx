import _ from 'lodash'
import { RenderCommand } from 'utils/formRendering/types'

export function transformToPhoneLayout(commands: RenderCommand[]) {
  return commands
}

const shortControls = new Set([
  'bool',
  'date',
  'date-time',
  'list',
  'list-with-labels',
])

const longControls = new Set([
  'text',
  'number',
  'phone-number',
  'sex',
  'gender',
])

const multiButtonControls = new Set(['sex', 'gender'])

export function transformToSmallerControl(
  commands: RenderCommand[],
  controlTitleMaxW: string,
  controlMaxW: string,
  controlType: Set<string>
) {
  const newCommands = [] as RenderCommand[]
  for (let i = 0; i < commands.length; i++) {
    const command1 = commands[i]
    const command2 = commands[i + 1]
    const command3 = commands[i + 2]
    if (
      command1 &&
      command2 &&
      command3 &&
      command1.type === 'title' &&
      command2.type === 'description' &&
      controlType.has(command3.type)
    ) {
      command1.maxW = controlTitleMaxW
      command3.fullwidth = multiButtonControls.has(command1.type)
      command3.maxW = controlMaxW
      newCommands.push({
        type: 'row-with-description',
        left: command1,
        right: command3,
        description: command2,
        valuePath: command1.valuePath,
        key: command1.key,
        disable: command1.disable,
      })
      i += 2
      continue
    } else if (
      command1 &&
      command2 &&
      command1.type === 'title' &&
      controlType.has(command2.type)
    ) {
      command1.maxW = controlTitleMaxW
      command2.fullwidth = multiButtonControls.has(command1.type)
      command2.maxW = controlMaxW
      newCommands.push({
        type: 'row',
        left: command1,
        right: command2,
        valuePath: command1.valuePath,
        key: command1.key,
        disable: command1.disable,
      })
      i += 1
      continue
    } else {
      newCommands.push(command1)
    }
  }
  return newCommands
}

export function transformToSmallerAllControls(
  commands: RenderCommand[],
  shortControlTitleMaxW: string,
  shortControlMaxW: string,
  longControlTitleMaxW: string,
  longControlMaxW: string
) {
  return transformToSmallerControl(
    transformToSmallerControl(
      commands,
      shortControlTitleMaxW,
      shortControlMaxW,
      shortControls
    ),
    longControlTitleMaxW,
    longControlMaxW,
    longControls
  )
}

export function transformToCompactLayout(commands: RenderCommand[]) {
  return transformToSmallerAllControls(
    commands,
    '600px',
    '200px',
    '400px',
    '400px'
  )
}

export function transformToLargeLayout(commands: RenderCommand[]) {
  return transformToSmallerAllControls(
    commands,
    '600px',
    '200px',
    '400px',
    '400px'
  )
}

export function transformToLayout(
  commands: RenderCommand[],
  layout: 'phone' | 'compact' | 'large'
) {
  switch (layout) {
    case 'phone':
      return transformToPhoneLayout(commands)
    case 'compact':
      return transformToCompactLayout(commands)
    case 'large':
      return transformToLargeLayout(commands)
  }
}
