import React from 'react'
import {
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Picker,
  Platform,
  ImageBackground,
} from 'react-native'
import {
  Icon,
  Button,
  ListItem,
  ButtonGroup,
  Image,
} from 'react-native-elements'
import DateTimePicker from 'components/DateTimePicker'
import _ from 'lodash'
import styles from 'styles'
import CardWrap from 'components/CardWrap'

/*
  Render all of the components of a form recursively. This function is applied
  to a section of a form with mapSectionWithPaths.
 */

export default function renderFnsWrapper(
  dynamicState,
  setDynamicState,
  loadedForm,
  navigation,
  formPaths,
  formGetPath,
  formSetPath,
  changedPaths,
  keepAlive,
  removeKeepAlive,
  addKeepAlive
) {
  return {
    pre: () => {
      return null
    },
    post: (entry, obj, index, formPath, pre, inner, subparts) => {
      var title = null
      var description = null
      if (_.has(obj, 'title')) {
        title = _.get(obj, 'title')
      }
      let rawDescription = null
      if (_.has(obj, 'description')) {
        rawDescription = _.get(obj, 'description')
        description = <Text style={styles.bottomSpace}>{rawDescription}</Text>
      }
      if (_.has(obj, 'text')) {
        rawDescription = _.get(obj, 'text')
        description = <Text style={styles.bottomSpace}>{rawDescription}</Text>
      }
      return (
        <CardWrap
          key={index}
          title={title}
          formPath={formPath}
          description={description}
          rawDescription={rawDescription}
          inner={inner}
          subparts={subparts}
          changedPaths={changedPaths}
          keepAlive={keepAlive}
        />
      )
    },
    _combineParts: (entry, obj, index, inner, formPath, subparts) => {
      return <View>{subparts}</View>
    },
    selectMultiple: (entry, obj, index, formPath, valuePaths, otherPath) => {
      if (_.get(obj, 'field.select-multiple')) {
        let items = _.get(obj, 'field.list-options').map((e, i) => {
          let valuePath = valuePaths[i]
          let fn = () => {
            if (formGetPath(valuePath)) {
              formSetPath(valuePath, false)
            } else {
              formSetPath(valuePath, true)
            }
          }
          return (
            <ListItem
              key={i}
              Component={TouchableOpacity}
              onPress={fn}
              containerStyle={styles.noTopBottomBorders}
            >
              <ListItem.CheckBox
                checked={formGetPath(valuePath)}
                onPress={fn}
              />
              <ListItem.Title>{_.upperFirst(e)}</ListItem.Title>
            </ListItem>
          )
        })
        if (_.get(obj, 'field.other')) {
          let fn = () => {
            if (formGetPath(otherPath)) {
              formSetPath(otherPath, null)
            } else {
              formSetPath(otherPath, '')
            }
          }
          items.push(
            <ListItem
              Component={TouchableOpacity}
              key={items.length}
              title={'Other'}
              checkBox={{
                checked: formGetPath(otherPath) != null,
                onPress: fn,
              }}
              onPress={fn}
              containerStyle={styles.noTopBottomBorders}
            />
          )
        }
        if (formGetPath(otherPath) != null) {
          items.push(
            <TextInput
              key={items.length}
              style={styles.hugeTextInput}
              placeholder={'Specify other'}
              textAlign={'left'}
              editable={true}
              multiline={true}
              numberOfLines={5}
              onChangeText={text => formSetPath(otherPath, text)}
              value={formGetPath(otherPath, '')}
            />
          )
        }
        return <View>{items}</View>
      } else {
        // TODO Error handling
        console.error(
          'UNSUPPORTED FIELD TYPE LIST WITHOUT SELECT MUTLIPLE',
          obj
        )
        return null
      }
    },
    signature: (entry, obj, index, formPath, valuePath) => {
      let icon = null
      let title = null
      let buttonStyle = {}
      let image = null
      if (formGetPath(valuePath)) {
        title = ' Replace signature'
        image = (
          <Image
            resizeMode="contain"
            style={{ width: 200, height: 200 }}
            source={{ uri: formGetPath(valuePath) }}
          />
        )
      } else {
        title = ' Sign here'
        icon = <Icon name="edit" size={15} color="white" />
        buttonStyle = { backgroundColor: 'red' }
      }
      return (
        <View>
          {image}
          <Button
            icon={icon}
            title={title}
            buttonStyle={buttonStyle}
            onPress={() =>
              navigation.navigate('Signature', {
                signed: dataImage => formSetPath(valuePath, dataImage),
                cancelSignature: () => formSetPath(valuePath, ''),
              })
            }
          />
        </View>
      )
    },
    'body-image': (entry, obj, index, formPath, valuePath) => {
      let title = null
      let image = null
      let icon = null
      let buttonStyle = {}
      const value = formGetPath(valuePath)
      if (value) {
        title = ' Restart diagram'
        image = (
          <ImageBackground
            imageStyle={{ resizeMode: 'contain' }}
            style={{ width: 200, height: 200 }}
            source={{ uri: formGetPath(valuePath).image }}
          >
            {value.annotations.map((annotation, idx) => (
              <View
                key={idx}
                style={{
                  position: 'absolute',
                  backgroundColor: 'black',
                  height: 5,
                  width: 5,
                  top: annotation.markerCoordinates.y * 200,
                  left: annotation.markerCoordinates.x * 200,
                }}
              />
            ))}
          </ImageBackground>
        )
      } else {
        title = ' Mark and annotate'
        icon = <Icon name="edit" size={15} color="white" />
        buttonStyle = { backgroundColor: '#d5001c' }
        let imageUri = loadedForm.files[_.get(obj, 'field.generic-image')]
        image = (
          <Image
            resizeMode="contain"
            style={{ width: 200, height: 200 }}
            source={{ uri: imageUri }}
          />
        )
      }
      return (
        <View>
          <View
            style={{
              justifyContent: 'center',
              flexDirection: 'row',
              marginBottom: 10,
            }}
          >
            {image}
          </View>
          <Button
            icon={icon}
            title={title}
            buttonStyle={buttonStyle}
            onPress={() =>
              navigation.navigate('Body', {
                baseImage: loadedForm.files[_.get(obj, 'field.generic-image')],
                enterData: (dataImage, annotations) => {
                  // TODO Do we want this behavior? You empty a field and it
                  // counts as not filled anymore
                  //
                  // if (annotations.length === 0) {
                  //     formSetPath(valuePath, "");
                  //     return;
                  // }
                  formSetPath(valuePath, {
                    image: dataImage,
                    annotations,
                  })
                },
              })
            }
          />
        </View>
      )
    },
    bool: (entry, obj, index, formPath, valuePath) => {
      let selected = _.has(formPaths, valuePath)
        ? formPaths[valuePath]
          ? 0
          : 1
        : null
      return (
        <ButtonGroup
          selectedIndex={selected}
          onPress={i => formSetPath(valuePath, i == 0)}
          buttons={['Yes', 'No']}
        />
      )
    },
    gender: (entry, obj, index, formPath, valuePath) => {
      let options = _.find(loadedForm.form.values, o => 'gender' == o.key)
      if (options) {
        options = options.value
      } else {
        // TODO This is a conservative approach if no gender key is specified
        // Do we want something else?
        options = [
          { key: 'male', value: 'Male' },
          { key: 'female', value: 'Female' },
        ]
      }
      let selected = formPaths[valuePath]
        ? _.indexOf(
            _.map(options, x => x.key),
            formPaths[valuePath]
          )
        : null
      return (
        <ButtonGroup
          selectedIndex={selected}
          onPress={i => formSetPath(valuePath, _.map(options, x => x.key)[i])}
          buttons={_.map(options, x => x.value)}
        />
      )
    },
    text: (entry, obj, index, formPath, valuePath) => {
      return (
        <TextInput
          style={{
            width: '100%',
            height: 40,
            borderColor: 'gray',
            borderBottomWidth: 1,
            borderRadius: 5,
            backgroundColor: '#F5F5F5',
          }}
          placeholder={_.get(obj, 'field.placeholder')}
          textAlign={'center'}
          editable={true}
          onChangeText={text => formSetPath(valuePath, text)}
          value={formGetPath(valuePath, '')}
        />
      )
    },
    'long-text': (entry, obj, index, formPath, valuePath) => {
      return (
        <TextInput
          style={{
            width: '100%',
            minHeight: 40,
            maxHeight: 40000 /* TODO This limits the entry to ~1000 lines or so */,
            borderColor: 'gray',
            borderBottomWidth: 1,
            borderRadius: 5,
            backgroundColor: '#F5F5F5',
          }}
          placeholder={_.get(obj, 'field.placeholder')}
          textAlign={'left'}
          editable={true}
          multiline={true}
          numberOfLines={5}
          onChangeText={text => formSetPath(valuePath, text)}
          value={formGetPath(valuePath, '')}
        />
      )
    },
    number: (entry, obj, index, formPath, valuePath) => {
      return (
        <TextInput
          style={{
            width: '100%',
            height: 40,
            borderColor: 'gray',
            borderBottomWidth: 1,
            borderRadius: 5,
            backgroundColor: '#F5F5F5',
          }}
          keyboardType={'numeric'}
          textAlign={'center'}
          editable={true}
          placeholder={_.get(obj, 'field.placeholder')}
          onChangeText={text => formSetPath(valuePath, text)}
          value={formGetPath(valuePath, '')}
        />
      )
    },
    address: (entry, obj, index, formPath, valuePath) => {
      return (
        <TextInput
          style={{
            width: '100%',
            height: 40,
            borderColor: 'gray',
            borderBottomWidth: 1,
            borderRadius: 5,
            backgroundColor: '#F5F5F5',
          }}
          textContentType={'fullStreetAddress'}
          keyboardType={'default'}
          textAlign={'center'}
          editable={true}
          placeholder={_.get(obj, 'field.placeholder')}
          onChangeText={text => formSetPath(valuePath, text)}
          value={formGetPath(valuePath, '')}
        />
      )
    },
    'phone-number': (entry, obj, index, formPath, valuePath) => {
      return (
        <TextInput
          style={{
            width: '100%',
            height: 40,
            borderColor: 'gray',
            borderBottomWidth: 1,
            borderRadius: 5,
            backgroundColor: '#F5F5F5',
          }}
          textContentType={'telephoneNumber'}
          keyboardType={'phone-pad'}
          textAlign={'center'}
          editable={true}
          placeholder={_.get(obj, 'field.placeholder')}
          onChangeText={text => formSetPath(valuePath, text)}
          value={formGetPath(valuePath, '')}
        />
      )
    },
    date: (entry, obj, index, formPath, valuePath) => {
      const current_value = formGetPath(valuePath)
      let buttonStyle = {}
      if (!current_value) {
        buttonStyle = { backgroundColor: '#d5001c' }
      }
      if (Platform.OS == 'web') {
        return (
          <DateTimePicker
            clearIcon={null}
            value={current_value}
            onChange={date => {
              formSetPath(valuePath, date)
            }}
            disableClock={true}
            onCancel={() => {
              setDynamicState({
                ['isVisible_dateTime_' + valuePath]: false,
              })
              removeKeepAlive(valuePath)
            }}
          />
        )
      } else {
        let picker = (
          <DateTimePicker
            isVisible={dynamicState['isVisible_dateTime_' + valuePath]}
            value={current_value}
            mode="date"
            onConfirm={date => {
              formSetPath(valuePath, date)
              setDynamicState({
                ['isVisible_dateTime_' + valuePath]: false,
              })
              removeKeepAlive(valuePath)
            }}
            onCancel={() => {
              setDynamicState({
                ['isVisible_dateTime_' + valuePath]: false,
              })
              removeKeepAlive(valuePath)
            }}
          />
        )
        return (
          <>
            <Button
              title={
                current_value
                  ? current_value.toLocaleDateString()
                  : 'Choose date'
              }
              buttonStyle={buttonStyle}
              onPress={() => {
                addKeepAlive(valuePath)
                setDynamicState({ ['isVisible_dateTime_' + valuePath]: true })
              }}
            />
            {dynamicState['isVisible_dateTime_' + valuePath] ? picker : null}
          </>
        )
      }
    },
    'date-time': (entry, obj, index, formPath, valuePath) => {
      const current_value = formGetPath(valuePath)
      let buttonStyle = {}
      if (!current_value) {
        buttonStyle = { backgroundColor: '#d5001c' }
      }
      if (Platform.OS == 'web') {
        return (
          <DateTimePicker
            clearIcon={null}
            value={current_value}
            onChange={date => {
              formSetPath(valuePath, date)
            }}
            onCancel={() => {
              setDynamicState({
                ['isVisible_dateTime_' + valuePath]: false,
              })
              removeKeepAlive(valuePath)
            }}
          />
        )
      } else {
        let picker = (
          <DateTimePicker
            isVisible={dynamicState['isVisible_dateTime_' + valuePath]}
            value={current_value}
            onConfirm={date => {
              formSetPath(valuePath, date)
              setDynamicState({
                ['isVisible_dateTime_' + valuePath]: false,
              })
              removeKeepAlive(valuePath)
            }}
            mode="datetime"
            onCancel={() => {
              setDynamicState({
                ['isVisible_dateTime_' + valuePath]: false,
              })
              removeKeepAlive(valuePath)
            }}
          />
        )
        return (
          <>
            <Button
              title={
                current_value
                  ? current_value.toLocaleString()
                  : 'Choose date and time'
              }
              buttonStyle={buttonStyle}
              onPress={() => {
                addKeepAlive(valuePath)
                setDynamicState({ ['isVisible_dateTime_' + valuePath]: true })
              }}
            />
            {dynamicState['isVisible_dateTime_' + valuePath] ? picker : null}
          </>
        )
      }
    },
    'list-with-labels': (entry, obj, index, formPath, valuePath) => {
      let options = _.get(obj, 'field.list-options')
      const ref = _.get(obj, 'field.list-options.Ref')
      if (ref) {
        // TODO Error handling
        options = _.find(loadedForm.form.values, o => ref == o.key).value
      }
      let items = options.map((e, i) => {
        return (
          <Picker.Item
            key={i}
            label={e.key + ' (' + e.value + ')'}
            value={e.value}
          />
        )
      })
      const current_value = formGetPath(valuePath)
      if (!current_value) {
        items = [
          <Picker.Item key={-1} label="Select a value" value={null} />,
        ].concat(items)
      }
      return (
        <Picker
          prompt={_.get(obj, 'title')}
          selectedValue={current_value == null ? -1 : current_value}
          style={{ height: 50, width: '100%' }}
          onValueChange={(itemValue, itemIndex) => {
            if (itemValue != null) {
              formSetPath(valuePath, itemValue)
            }
          }}
        >
          {items}
        </Picker>
      )
    },
  }
}
