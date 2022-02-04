import React from 'react'
import { Text, View } from 'react-native'
import { Header, Icon, Button } from 'react-native-elements'

const FormTop = ({
  sectionOffset,
  currentSection,
  openSideMenu,
  title,
  lastSection,
  isSectionCompleted,
}) => {
  return (
    <Header
      leftComponent={{
        icon: 'menu',
        color: '#fff',
        onPress: openSideMenu,
      }}
      centerComponent={
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            title=""
            icon={<Icon name="arrow-back" size={15} color="white" />}
            disabled={currentSection == 0}
            onPress={() => sectionOffset(-1)}
          />
          <Text
            style={{
              width: '60%',
              marginLeft: '10%',
              marginRight: '10%',
              color: '#fff',
            }}
            textAlign="center"
          >
            Section {currentSection + 1}
            {'\n'}
            {title ? title : ''}
          </Text>
          <Button
            title=""
            disabled={currentSection == lastSection}
            onPress={() => sectionOffset(1)}
            icon={<Icon name="arrow-forward" size={15} color="white" />}
            iconRight
          />
        </View>
      }
      rightComponent={
        // TODO Change this to a submit button
        { text: '30%', style: { color: '#fff' } }
      }
      containerStyle={{
        backgroundColor: isSectionCompleted ? '#1cd500' : '#d5001c',
        justifyContent: 'space-around',
      }}
    />
  )
}

export default React.memo(FormTop)
