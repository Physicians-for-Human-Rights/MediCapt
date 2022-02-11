import React from 'react'
import { View } from 'react-native'
import { Icon, Button } from 'react-native-elements'

import _ from 'lodash'

const FormBottom = ({
  sectionOffset,
  currentSection,
  title,
  lastSection,
  isSectionCompleted,
}) => {
  return (
    <View style={{ marginBottom: '10%' }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          marginTop: '5%',

          flexDirection: 'row',
          justifyContent: 'space-around',
        }}
      >
        <Button
          title=" Previous section"
          icon={<Icon name="arrow-back" size={15} color="white" />}
          disabled={currentSection == 0}
          onPress={() => sectionOffset(-1)}
        />
        <Button
          title="Next section "
          disabled={currentSection == lastSection}
          onPress={() => sectionOffset(1)}
          icon={<Icon name="arrow-forward" size={15} color="white" />}
          iconRight
        />
      </View>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          marginTop: '5%',

          flexDirection: 'row',
          justifyContent: 'space-around',
        }}
      >
        <Button
          title=" Save partial"
          icon={<Icon name="save" size={15} color="white" />}
        />
        <Button
          title="Print "
          icon={<Icon name="print" size={15} color="white" />}
          iconRight
        />
      </View>
    </View>
  )
}

export default React.memo(FormBottom)
