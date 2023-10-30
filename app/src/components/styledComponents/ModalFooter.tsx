import { View } from 'react-native'
import { Button } from '@ui-kitten/components'
import themedStyles from '../../themeStyled'
import { spacing, layout } from '../styles'

const ModalFooter = (props: any) => {
  const { onDeleteMarker, onCancelMarker, onSaveMarker } = props
  return (
    <View>
      <Button
        style={[spacing.mr2]}
        appearance="ghost"
        status="danger"
        onPress={onDeleteMarker}
      >
        Delete
      </Button>
      <Button
        style={[spacing.mr2]}
        appearance="ghost"
        status="info"
        onPress={onCancelMarker}
      >
        Cancel
      </Button>
      <Button status="info" onPress={onSaveMarker}>
        Save
      </Button>
    </View>
  )
}

export default ModalFooter
