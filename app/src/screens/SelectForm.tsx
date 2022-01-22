import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-navigation";
import {
    Header,
    Icon,
    Button,
    ListItem,
    ButtonGroup
} from "react-native-elements";

import * as Localization from "expo-localization";

import { connect } from "react-redux";
import { formSetId } from "../redux/actions";

import styles from "../styles";

const formList = require("../../assets/forms/forms.json");
const countries = require("../../assets/countries.json");
const handled_countries = Object.keys(formList);
const countries_button_labels = handled_countries.map(country => {
    return countries[country].name["common"];
});

function guessCountry() {
    if (handled_countries.indexOf(Localization.region) >= 0) {
        return Localization.region;
    } else {
        return handled_countries[0];
    }
}

class SelectForm extends React.Component {
    static navigationOptions = {
        title: "Forms by country",
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            country: null
        };
    }

    _loadInitialState = async () => {
        try {
            let country = await AsyncStorage.getItem("last-used-country");
            this.setState({
                loaded: true,
                country: country ? country : guessCountry()
            });
        } catch (error) {
            this.setState({ loaded: true, country: guessCountry() });
        }
    };

    async componentDidMount() {
        await this._loadInitialState();
    }

    render() {
        if (!this.state.loaded) {
            return (
                <SafeAreaView forceInset={{ top: "always" }} style={styles.container}>
                    <Text>Loading...</Text>
                </SafeAreaView>
            );
        } else {
            let listOfForms = [];
            if (formList[this.state.country]) {
                listOfForms = formList[this.state.country].map((e, i) => {
                    return (
                        <ListItem key={i}
                                  Component={TouchableOpacity}
                                  onPress={() => {this.props.formSetId(e); this.props.navigation.navigate("Form");}}
                        >
                            <ListItem.Title>
                                { e.name }
                            </ListItem.Title>
                            <ListItem.Subtitle>
                                { e.subtitle }
                            </ListItem.Subtitle>
                            <ListItem.Chevron color="black" />
                        </ListItem>
                    )
                });
            } else {
                listOfForms = <Text> No form avilable for this country. </Text>;
            }
            return (
                <View style={styles.container}>
                    <Header
                        centerComponent={{
                            text: "Select a form",
                            style: { color: "#fff" }
                        }}
                        containerStyle={{
                            backgroundColor: "#d5001c",
                            justifyContent: "space-around",
                            width: "100%"
                        }}
                    />
                    <View style={{ flex: 0.1, width: "80%" }}></View>
                    <View style={{ flex: 0.5, width: "80%" }}>
                        <ButtonGroup
                            onPress={idx =>
                                this.setState({ country: handled_countries[idx] })
                            }
                            selectedIndex={handled_countries.indexOf(this.state.country)}
                            buttons={countries_button_labels}
                        />
                    </View>
                    <View style={{ flex: 3.5, width: "80%" }}>{listOfForms}</View>
                </View>
            );
        }
    }
}

export default connect(
    null,
    { formSetId }
)(SelectForm);
