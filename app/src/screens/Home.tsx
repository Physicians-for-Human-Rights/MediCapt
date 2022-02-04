import React, { useMemo } from 'react'
import { ActivityIndicator, Text, Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Icon, Button } from 'react-native-elements'
import { API, Auth } from 'aws-amplify'
import medicapt_logo from '../../assets/medicapt.png'
import phr_logo from '../../assets/phr.png'
import styles from '../styles'
import isEmpty from 'lodash/isEmpty'

import { useUser, useSignOut } from 'utils/store'

const ButtonWithIconBackground = ({ label, onPress, iconName, iconType }) => (
  <View style={{ flex: 1 }}>
    <View style={{ zIndex: 1 }}>
      <Button
        title={label}
        containerViewStyle={{
          image: "imgUrl('../../assets/medicapt.png')",
        }}
        onPress={onPress}
        buttonStyle={styles.largeTileButton}
        titleStyle={{ color: '#d5001c' }}
        type="outline"
      />
    </View>
    <View style={{ zIndex: 0, position: 'absolute', width: '100%' }}>
      <Button
        style={{ alignSelf: 'stretch' }}
        onPress={onPress}
        buttonStyle={styles.largeTileButton}
        titleStyle={{ color: '#d5001c' }}
        type="outline"
        icon={
          <Icon name={iconName} type={iconType} size={100} color="#0039d515" />
        }
      />
    </View>
  </View>
)

type Props = NativeStackScreenProps

export default function HomeScreen({ navigation }: Props) {
  const [user] = useUser()
  const [signOut] = useSignOut()

  const createNewRecord = () => navigation.navigate('SelectForm')
  const incompleteRecords = () => navigation.navigate('Other')
  const findRecord = async () => {
    const data = await API.get('provider', '/provider/record/by-user', {})
    console.log('DEBUGGING API Returned', data)
  }
  const loadSettings = () => navigation.navigate('Other')
  const signOutEverywhere = () => {
    signOut()
    Auth.signOut({ global: true })
      .then(data => navigation.navigate('Authentication'))
      .catch(err => {
        console.log('Auth error', err)
      }) // TODO What else can we do on error?
  }

  if (!isEmpty(user)) {
    return (
      <SafeAreaView forceInset={{ top: 'always' }} style={styles.container}>
        <View
          style={{
            justifyContent: 'space-around',
            flex: 2,
            flexDirection: 'row',
          }}
        >
          <View style={{ flex: 1 }}>
            <Image source={medicapt_logo} style={styles.logo} />
          </View>
          <View style={{ flex: 1 }}>
            <Image source={phr_logo} style={styles.logo} />
          </View>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View>
            <Text style={styles.welcomeText}> {user.attributes.name} </Text>
          </View>
        </View>
        <View style={{ flex: 4 }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              minWidth: '80%',
            }}
          >
            <ButtonWithIconBackground
              label="Create new record"
              onPress={createNewRecord}
              iconName="plus"
              iconType="foundation"
            />
            <View style={{ flex: 0.4 }} />
            <ButtonWithIconBackground
              label="Incomplete records"
              onPress={incompleteRecords}
              iconName="pencil"
              iconType="foundation"
            />
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <ButtonWithIconBackground
              label="Find record"
              onPress={findRecord}
              iconName="search"
              iconType="font-awesome"
            />
            <View style={{ flex: 0.4 }} />
            <ButtonWithIconBackground
              label="Settings"
              onPress={loadSettings}
              iconName="cog"
              iconType="font-awesome"
            />
          </View>
        </View>
        <View
          style={{
            flex: 0.6,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View style={{ marginRight: 30 }}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
          <View>
            <Text style={styles.syncText}>Synchronizing 3 records</Text>
          </View>
        </View>
        <View style={styles.sideBySideButtons}>
          <View style={styles.simpleButton}>
            <Button
              raised
              title="Log out everywhere"
              onPress={signOutEverywhere}
            />
          </View>
          <View style={styles.simpleButton}>
            <Button raised title="Log out" onPress={signOut} />
          </View>
        </View>
      </SafeAreaView>
    )
  } else {
    return <></>
  }
}
