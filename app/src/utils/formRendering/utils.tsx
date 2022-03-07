import { RenderCommand } from 'utils/formRendering/types'

export function disabled(
  command: RenderCommand,
  whenDisabled: string,
  whenEnabled: string | undefined = undefined
) {
  if (command.disable) return whenDisabled
  return whenEnabled
}

export const disabledBackground = 'coolGray.100'
