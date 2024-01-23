import { useStoreState } from '../../utils/store'
import { useTheme, Text } from '@ui-kitten/components'

export const requiredText = () => {
  const state = useStoreState()
  const i18n = state?.i18n
  const theme = useTheme()
  return (
    <Text style={{ color: theme['color-danger-500'] }} category="label">
      {i18n.t('form.required')}
    </Text>
  )
}

export const ErrorMsg = (props: any) => {
  const { text } = props
  const theme = useTheme()
  return (
    <Text style={{ color: theme['color-danger-500'] }} category="label">
      {text}
    </Text>
  )
}
