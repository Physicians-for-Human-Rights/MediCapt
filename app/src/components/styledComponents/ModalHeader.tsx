import { View } from 'react-native'
import { Text } from '@ui-kitten/components'
import themedStyles from 'themeStyled'
import { spacing, layout } from '../styles'

const ModalHeader = (props: any) => {
  const { text } = props
  return (
    <View>
      <Text category="h6">{text}</Text>
    </View>
  )
}

export default ModalHeader
