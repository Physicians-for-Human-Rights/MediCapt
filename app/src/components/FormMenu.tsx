import React from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { Header, ListItem, Badge } from 'react-native-elements'
import styles from 'styles'

import _ from 'lodash'

function Menu({
  navigation,
  formSections,
  changeSection,
  isSectionCompleteList,
}) {
  let sectionItems = []
  if (formSections) {
    sectionItems = formSections.map((e, i) => (
      <ListItem
        key={i}
        containerStyle={styles.topBorder}
        Component={TouchableOpacity}
        onPress={x => {
          console.log('PRESS', x)
          console.log(x.target.getAttribute('data-index'))
          changeSection(i)
        }}
      >
        <Badge
          value={i + 1}
          status={isSectionCompleteList[i] ? 'success' : 'error'}
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

const RerenderIfNecessary = React.memo(Menu, (prevProps, nextProps) => {
  return (
    prevProps.formSections === nextProps.formSections &&
    _.isEqual(prevProps.isSectionCompleteList, nextProps.isSectionCompleteList)
  )
})

export default RerenderIfNecessary
