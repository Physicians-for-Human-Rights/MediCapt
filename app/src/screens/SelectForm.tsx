import React, { useState, useEffect } from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Header, ListItem, ButtonGroup } from 'react-native-elements'
import * as Localization from 'expo-localization'
import styles from 'styles'

import { FormsMetadata } from 'utils/formTypesHelpers'

const formList: Record<
  string,
  FormsMetadata[]
> = require('../../assets/forms/forms.json')
const countries = require('../../assets/countries.json')
const handled_countries = Object.keys(formList)
const countries_button_labels = handled_countries.map(country => {
  return countries[country].name['common']
})

function guessCountry() {
  if (
    Localization.region &&
    handled_countries.indexOf(Localization.region) >= 0
  ) {
    return Localization.region
  } else {
    return handled_countries[0]
  }
}

export default function SelectForm({ navigation }) {
  const [loaded, setLoaded] = useState(false)
  const [country, setCountry] = useState(null as null | string)
  const [formId, setFormId] = useState(null)

  useEffect(() => {
    async function fn() {
      let country = await AsyncStorage.getItem('last-used-country')
      setCountry(country ? country : guessCountry())
      setLoaded(true)
    }
    fn()
  }, [])

  if (!loaded || !country) {
    return (
      <SafeAreaView forceInset={{ top: 'always' }} style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    )
  } else {
    let listOfForms: JSX.Element[] = []
    if (country && formList[country]) {
      listOfForms = formList[country].map((formMetadata, i) => {
        return (
          <ListItem
            key={i}
            Component={TouchableOpacity}
            onPress={() => navigation.navigate('Form', { formMetadata })}
          >
            <ListItem.Title>{formMetadata.name}</ListItem.Title>
            <ListItem.Subtitle>{formMetadata.subtitle}</ListItem.Subtitle>
            <ListItem.Chevron color="black" />
          </ListItem>
        )
      })
    } else {
      listOfForms = [
        <ListItem key={-1}>
          <Text> No form avilable for this country. </Text>
        </ListItem>,
      ]
    }
    return (
      <View style={styles.container}>
        <Header
          centerComponent={{
            text: 'Select a form',
            style: { color: '#fff' },
          }}
          containerStyle={{
            backgroundColor: '#d5001c',
            justifyContent: 'space-around',
            width: '100%',
          }}
        />
        <View style={{ flex: 0.1, width: '80%' }}></View>
        <View style={{ flex: 0.5, width: '80%' }}>
          <ButtonGroup
            onPress={idx => {
              setCountry(handled_countries[idx])
              AsyncStorage.setItem('last-used-country', handled_countries[idx])
            }}
            selectedIndex={handled_countries.indexOf(country)}
            buttons={countries_button_labels}
          />
        </View>
        <View style={{ flex: 3.5, width: '80%' }}>{listOfForms}</View>
      </View>
    )
  }
}
