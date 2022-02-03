import React from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import {
  createSwitchNavigator,
  createAppContainer,
  SafeAreaView,
} from 'react-navigation'
import { Header, ListItem, Badge } from 'react-native-elements'
import DateTimePicker from './DateTimePicker'

import _ from 'lodash'

export default class Menu extends React.PureComponent {
  render() {
    let sectionItems = []
    if (this.props.formSections) {
      sectionItems = this.props.formSections.map((e, i) => (
        <ListItem
          key={i}
          containerStyle={{
            borderTopWidth: 1,
            borderBottomWidth: 0,
          }}
          Component={TouchableOpacity}
          onPress={x => {
            this.props.changeSection(i)
          }}
        >
          <Badge
            value={i + 1}
            status={this.props.isSectionComplete[i] ? 'success' : 'error'}
          />
          <ListItem.Title>{e.title}</ListItem.Title>
        </ListItem>
      ))
    }
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: '#b3d9ff' }}
        scrollsToTop={false}
      >
        <Header
          centerComponent={{
            text: 'Form sections',
            style: { color: '#000' },
          }}
          containerStyle={{
            backgroundColor: '#b3d9ff',
            justifyContent: 'space-around',
          }}
        />
        {sectionItems}
      </ScrollView>
    )
  }
}
