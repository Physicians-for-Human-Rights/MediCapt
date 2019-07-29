import React from "react";
import {
    ActivityIndicator,
    StatusBar,
    AsyncStorage,
    Button,
    StyleSheet,
    Text,
    View
} from "react-native";
import {
    createStackNavigator,
    createSwitchNavigator,
    createAppContainer,
    SafeAreaView
} from "react-navigation";

import Amplify from "aws-amplify";
import config from "./config.js";

class Start extends React.Component {
    static navigationOptions = {
        title: "Lots of features here"
    };
    state = {};
    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Button title="I'm done, sign me out" onPress={this._signOutAsync} />
                <StatusBar barStyle="default" />
            </SafeAreaView>
        );
    }
}

class BasicForm extends React.Component {
    static navigationOptions = {
        title: "Lots of features here"
    };
    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Button title="I'm done, sign me out" onPress={this._signOutAsync} />
                <StatusBar barStyle="default" />
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }
});

const FormStack = createStackNavigator({
    Start: Start,
    BasicForm: BasicForm
});

export default FormStack;
