import React from "react";
import {
    ActivityIndicator,
    StatusBar,
    AsyncStorage,
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
    createStackNavigator,
    createSwitchNavigator,
    createAppContainer,
    SafeAreaView
} from "react-navigation";
import {
    Header,
    Icon,
    Button,
    ListItem,
    ButtonGroup,
    Card,
    Image
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

export default class FormBottom extends React.PureComponent {
    render() {
        return (
            <View style={{ marginBottom: "10%" }}>
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        marginTop: "5%",

                        flexDirection: "row",
                        justifyContent: "space-around"
                    }}
                >
                    <Button
                        title=" Previous section"
                        icon={<Icon name="arrow-back" size={15} color="white" />}
                        disabled={this.props.currentSection == 0}
                        onPress={() => this.props.sectionOffset(-1)}
                    />
                    <Button
                        title="Next section "
                        disabled={this.props.currentSection == this.props.lastSection}
                        onPress={() => this.props.sectionOffset(1)}
                        icon={<Icon name="arrow-forward" size={15} color="white" />}
                        iconRight
                    />
                </View>
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        marginTop: "5%",

                        flexDirection: "row",
                        justifyContent: "space-around"
                    }}
                >
                    <Button
                        title=" Save partial"
                        icon={<Icon name="save" size={15} color="white" />}
                    />
                    <Button
                        title="Print "
                        icon={<Icon name="print" size={15} color="white" />}
                        iconRight
                    />
                </View>
            </View>
        );
    }
}
