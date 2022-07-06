import _ from 'lodash'
import { RenderCommand } from 'utils/formRendering/types'

export function disabled(
  command: RenderCommand,
  whenDisabled: string,
  whenEnabled: string | undefined = undefined
) {
  if (command.disable) return whenDisabled
  return whenEnabled
}

export const disabledBackground = 'coolGray.50'

export function disableRenderCommand(c: RenderCommand): RenderCommand {
  c.disable = true
  if (c.type === 'padding') disableRenderCommand(c.contents)
  if (c.type === 'row') {
    disableRenderCommand(c.left)
    disableRenderCommand(c.right)
  }
  if (c.type === 'row-with-description') {
    disableRenderCommand(c.left)
    disableRenderCommand(c.right)
    disableRenderCommand(c.description)
  }
  return c
}

export function disableRenderCommands(c: RenderCommand[]): RenderCommand[] {
  return _.map(c, disableRenderCommand)
}
