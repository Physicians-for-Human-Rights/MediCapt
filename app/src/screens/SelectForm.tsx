import React from "react";
import {
    ActivityIndicator,
    StatusBar,
    AsyncStorage,
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
import { Icon, Button, ListItem } from "react-native-elements";

import * as Localization from "expo-localization";
import CountryPicker, {
    getAllCountries
} from "react-native-country-picker-modal";

import Amplify from "aws-amplify";
import config from "./config.js";

import styles from "../styles";
/*
 * import formList from ; */

const formList = require("../../assets/forms/forms.json");

export default class SelectForm extends React.Component {
    static navigationOptions = {
        title: "Forms by country"
    };
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            countries: getAllCountries(),
            country: null
        };
    }

    _loadInitialState = async () => {
        try {
            let country = await AsyncStorage.getItem("last-used-country");
            this.setState({
                loaded: true,
                country: country ? country : Localization.country
            });
        } catch (error) {
            this.setState({ loaded: true, country: Localization.country });
        }
    };

    componentWillMount() {
        this._loadInitialState().done();
    }

    render() {
        if (!this.state.loaded) {
            return (
                <SafeAreaView forceInset={{ top: "always" }} style={styles.container}>
                    <Text>Loading...</Text>
                </SafeAreaView>
            );
        } else {
            if (formList[this.state.country]) {
                listOfForms = formList[this.state.country].map((e, i) => (
                    <ListItem key={i} title={e.name} subtitle={e.subtitle} />
                ));
            } else {
                listOfForms = <Text> No form avilable for this country. </Text>;
            }
            return (
                <SafeAreaView forceInset={{ top: "always" }} style={styles.container}>
                    <View style={{ flex: 1 }}>
                        <CountryPicker
                            onChange={value => {
                                // TODO Error handling
                                AsyncStorage.setItem("last-used-country", value.cca2, () => {
                                    this.setState({ country: value.cca2 });
                                });
                            }}
                            hideAlphabetFilter={true}
                            cca2={this.state.country}
                            translation="eng"
                        >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                {CountryPicker.renderFlag(this.state.country, {
                                    height: 36,
                                    width: 45
                                })}
                                <Text>{this.state.country}</Text>
                            </View>
                        </CountryPicker>
                    </View>
                    <View style={{ flex: 1, width: "80%" }}>{listOfForms}</View>
                </SafeAreaView>
            );
        }
    }
}
/*
 * <SafeAreaView forceInset={{ top: "always" }} style={styles.container}>
 * <Text>Pick country</Text>
 * </SafeAreaView> */
