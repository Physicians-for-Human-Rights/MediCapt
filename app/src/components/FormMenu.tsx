import React from "react";
import {
    ActivityIndicator,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Keyboard,
    Picker,
    Platform
} from "react-native";
import {
    createSwitchNavigator,
    createAppContainer,
    SafeAreaView
} from "react-navigation";
import { createStackNavigator } from 'react-navigation-stack';
import {
    Header,
    Icon,
    Button,
    ListItem,
    ButtonGroup,
    Card,
    Image,
    Badge
} from "react-native-elements";
import SideMenu from "react-native-side-menu";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DateTimePicker from "./DateTimePicker";

import ExpoPixi from "expo-pixi";

import _ from "lodash";

function plainToFlattenObject(object) {
    const result = {};
    function flatten(obj, prefix = "") {
        _.forEach(obj, (value, key) => {
            if (_.isObject(value)) {
                flatten(value, `${prefix}${key}.`);
            } else {
                result[`${prefix}${key}`] = value;
            }
        });
    }
    flatten(object);
    return result;
}

function objectPaths(object) {
    const result = [];
    function flatten(obj, prefix = "") {
        _.forEach(obj, (value, key) => {
            if (_.isObject(value)) {
                flatten(value, `${prefix}${key}.`);
            } else {
                result.push(`${prefix}${key}`);
            }
        });
    }
    flatten(object);
    return result;
}

import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";

import { connect } from "react-redux";
import { formSetPath } from "../redux/actions";
import yaml from "js-yaml";

import styles from "../styles";

import allForms from "../allForms";

export default class Menu extends React.PureComponent {
    render() {
        let sectionItems = [];
        if (this.props.formSections) {
            sectionItems = this.props.formSections.map((e, i) => (
                <ListItem
                    key={i}
                    containerStyle={{
                        borderTopWidth: 1,
                        borderBottomWidth: 0
                    }}
                    Component={TouchableOpacity}
                    onPress={x => {
                        this.props.changeSection(i);
                    }}
                >
                <Badge
                value={i + 1}
                        status={this.props.isSectionComplete[i] ? "success" : "error"}
                    />
                    <ListItem.Title>
                        {e.title}
                    </ListItem.Title>
                </ListItem>
            ));
        }
        return (
            <ScrollView
                style={{ flex: 1, backgroundColor: "#b3d9ff" }}
                scrollsToTop={false}
            >
                <Header
                    centerComponent={{
                        text: "Form sections",
                        style: { color: "#000" }
                    }}
                    containerStyle={{
                        backgroundColor: "#b3d9ff",
                        justifyContent: "space-around"
                    }}
                />
                {sectionItems}
            </ScrollView>
        );
    }
}
