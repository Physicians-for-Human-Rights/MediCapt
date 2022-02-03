import React from 'react'
import { View } from 'react-native'
import {
  createSwitchNavigator,
  createAppContainer,
  SafeAreaView,
} from 'react-navigation'
import { Icon, Button } from 'react-native-elements'
import DateTimePicker from './DateTimePicker'

import _ from 'lodash'

export default class FormBottom extends React.PureComponent {
  render() {
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
            disabled={this.props.currentSection == 0}
            onPress={() => this.props.sectionOffset(-1)}
          />
          <Button
            title="Next section "
            disabled={this.props.currentSection == this.props.lastSection}
            onPress={() => this.props.sectionOffset(1)}
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
}
