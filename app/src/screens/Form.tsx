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

type Props = NavigationScreenProps;

import allForms from "../allForms";

class Menu extends React.Component {
    /* shouldComponentUpdate(nextProps, nextState) {
     *     console.log(nextProps)
     *     console.log(nextState)
     *     return true;
     * } */
    componentDidUpdate(prevProps, prevState) {
        if (this.props) {
            Object.entries(this.props).forEach(([key, val]) =>
                prevProps[key] !== val && console.log(`M Prop '${key}' changed`)
            );
        }
        if (this.state) {
            Object.entries(this.state).forEach(([key, val]) =>
                prevState[key] !== val && console.log(`M State '${key}' changed`)
            );
        }
    }

    render() {
        let sectionItems = [];
        if (this.props.formSections) {
            sectionItems = this.props.formSections.map((e, i) => (
                <ListItem
                    key={i}
                    title={e.title}
                    containerStyle={{
                        borderTopWidth: 1,
                        borderBottomWidth: 0
                    }}
                    Component={TouchableOpacity}
                    badge={{
                        value: i + 1,
                        status: this.props.isSectionComplete(i) ? "success" : "error"
                    }}
                    onPress={() => this.props.changeSection(i)}
                />
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

function mapSectionWithPaths(section, getValue, fns, pre, post) {
    function process(entry, index, formPath) {
        if (Array.isArray(entry)) {
            return entry.map((e, i) => {
                return process(e, i, formPath);
            });
        } else {
            const obj = entry[Object.keys(entry)[0]];
            let inner = null;
            formPath = formPath + "." + Object.keys(entry)[0];
            if (_.has(obj, "only-when.path") && _.has(obj, "only-when.value")) {
                if (
                    getValue(_.get(obj, "only-when.path")) !=
                    _.has(obj, "only-when.value")
                )
                    return null;
            }
            let pre = fns.pre && fns.pre(entry, obj, index, formPath);
            const field_type = _.get(obj, "field.type");
            if (field_type) {
                switch (field_type) {
                    case "list":
                        if (_.get(obj, "field.select-multiple")) {
                            inner = fns.selectMultiple(
                                entry,
                                obj,
                                index,
                                formPath,
                                _.get(obj, "field.list-options").map((e, i) => {
                                    return formPath + ".field.value." + i;
                                }),
                                _.get(obj, "field.other")
                                    ? formPath + ".field.value.other"
                                    : null
                            );
                        } else {
                            console.log(
                                "UNSUPPORTED FIELD TYPE LIST WITHOUT SELECT MUTLIPLE"
                            );
                            console.log(obj);
                        }
                        break;
                    default:
                        if (fns[field_type]) {
                            inner = fns[field_type](
                                entry,
                                obj,
                                index,
                                formPath,
                                formPath + ".field.value"
                            );
                        } else {
                            console.log("UNSUPPORTED FIELD TYPE");
                            console.log(obj);
                        }
                        break;
                }
            }
            let subparts = null;
            if (_.has(obj, "parts")) {
                subparts = fns._combineParts(
                    entry,
                    obj,
                    index,
                    formPath,
                    inner,
                    process(obj.parts, 0, formPath + ".parts")
                );
            }
            return fns.post(entry, obj, index, formPath, pre, inner, subparts);
        }
    }
    return process(section.content.parts, 0, "root." + section.name);
}

function allFormValuePathsForSection(section, getValue) {
    let allValuePaths = [];
    mapSectionWithPaths(section, getValue, {
        selectMultiple: (entry, obj, index, formPath, valuePaths) =>
            (allValuePaths = allValuePaths.concat(valuePaths)),
        signature: (entry, obj, index, formPath, valuePath) =>
            allValuePaths.push(valuePath),
        bool: (entry, obj, index, formPath, valuePath) =>
            allValuePaths.push(valuePath),
        gender: (entry, obj, index, formPath, valuePath) =>
            allValuePaths.push(valuePath),
        text: (entry, obj, index, formPath, valuePath) =>
            allValuePaths.push(valuePath),
        "long-text": (entry, obj, index, formPath, valuePath) =>
            allValuePaths.push(valuePath),
        number: (entry, obj, index, formPath, valuePath) =>
            allValuePaths.push(valuePath),
        date: (entry, obj, index, formPath, valuePath) =>
            allValuePaths.push(valuePath),
        "date-time": (entry, obj, index, formPath, valuePath) =>
            allValuePaths.push(valuePath),
        list: (entry, obj, index, formPath, valuePath) =>
            allValuePaths.push(valuePath),
        "list-with-labels": (entry, obj, index, formPath, valuePath) =>
            allValuePaths.push(valuePath),
        "phone-number": (entry, obj, index, formPath, valuePath) =>
            allValuePaths.push(valuePath),
        address: (entry, obj, index, formPath, valuePath) =>
            allValuePaths.push(valuePath),
        _combineParts: (entry, obj, index, inner, outer) => null,
        post: (entry, obj, index, formPath, pre, inner, subparts) => null
    });
    return allValuePaths;
}

function isSectionComplete(section, getValue) {
    let complete = true;
    mapSectionWithPaths(section, getValue, {
        selectMultiple: (entry, obj, index, formPath, valuePaths) =>
            // NB This checks not that getValue exists, but that at least one of them is also true.
            (complete = complete && _.some(valuePaths, x => getValue(x))),
        signature: (entry, obj, index, formPath, valuePath) =>
            (complete = complete && getValue(valuePath) != null),
        bool: (entry, obj, index, formPath, valuePath) =>
            (complete = complete && getValue(valuePath) != null),
        gender: (entry, obj, index, formPath, valuePath) =>
            (complete = complete && getValue(valuePath) != null),
        text: (entry, obj, index, formPath, valuePath) =>
            (complete = complete && getValue(valuePath) != null),
        "long-text": (entry, obj, index, formPath, valuePath) =>
            (complete = complete && getValue(valuePath) != null),
        number: (entry, obj, index, formPath, valuePath) =>
            (complete = complete && getValue(valuePath) != null),
        date: (entry, obj, index, formPath, valuePath) =>
            (complete = complete && getValue(valuePath) != null),
        "date-time": (entry, obj, index, formPath, valuePath) =>
            (complete = complete && getValue(valuePath) != null),
        list: (entry, obj, index, formPath, valuePath) =>
            (complete = complete && getValue(valuePath) != null),
        "list-with-labels": (entry, obj, index, formPath, valuePath) =>
            (complete = complete && getValue(valuePath) != null),
        "phone-number": (entry, obj, index, formPath, valuePath) =>
            (complete = complete && getValue(valuePath) != null),
        address: (entry, obj, index, formPath, valuePath) =>
            (complete = complete && getValue(valuePath) != null),
        _combineParts: (entry, obj, index, inner, outer) => null,
        post: (entry, obj, index, formPath, pre, inner, subparts) => null
    });
    return complete;
}

class Form extends React.Component<Props> {
    static navigationOptions = {
        title: "Lots of features here",
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            files: null,
            form: null,
            formSections: null,
            currentSection: 1, // TODO Debugging
            sectionChanged: false,
            // NB Recomputing this each update introduces noticeable lag.
            sectionCompletionStatusCache: []
        };
    }

    _loadForm = async () => {
        // TODO Error handling
        let files = _.fromPairs(
            await Promise.all(
                _.toPairs(allForms[this.props.formId.path]).map(async p => {
                    const filename = p[0];
                    let f = Asset.fromModule(p[1]);
                    await f.downloadAsync();
                    let content = null;
                    switch (filename.split(".").pop()) {
                        case "yaml":
                            if (Platform.OS == "web") {
                                content = await fetch(f.localUri);
                                content = await content.text();
                            } else {
                                content = await FileSystem.readAsStringAsync(f.localUri);
                            }
                            break;
                        case "svg":
                            if (Platform.OS == "web") {
                                content = await fetch(f.localUri);
                                content = await content.blob();
                                const reader = new FileReader();
                                reader.onload = function() {
                                    content = this.result;
                                };
                                reader.readAsDataURL(content);
                            } else {
                                content = await FileSystem.readAsStringAsync(f.localUri, {
                                    encoding: FileSystem.EncodingType.Base64
                                });
                            }
                            content = "data:image/svg+xml;base64," + content;
                            break;
                        case "png":
                            content = await FileSystem.readAsStringAsync(f.localUri, {
                                encoding: FileSystem.EncodingType.Base64
                            });
                            content = "data:image/png;base64," + content;
                            break;
                        case "jpg":
                            if (Platform.OS == "web") {
                                content = await fetch(f.localUri);
                                content = await content.blob();
                                const reader = new FileReader();
                                reader.onload = function() {
                                    content = this.result;
                                };
                                reader.readAsDataURL(content);
                            } else {
                                content = await FileSystem.readAsStringAsync(f.localUri, {
                                    encoding: FileSystem.EncodingType.Base64
                                });
                            }
                            content = "data:image/jpg;base64," + content;
                            break;
                        default:
                            // TODO Error handling
                            content = await FileSystem.readAsStringAsync(f.localUri, {
                                encoding: FileSystem.EncodingType.Base64
                            });
                    }
                    return [filename, content];
                })
            )
        );
        let form = yaml.load(files["form.yaml"]);
        let formSections = form.root.map(e => {
            return {
                name: Object.keys(e)[0],
                title: e[Object.keys(e)[0]].title,
                content: e[Object.keys(e)[0]]
            };
        });
        this.setState({
            files: files,
            form: form,
            formSections: formSections,
            sectionCompletionStatusCache: formSections.map(() => false)
        });
    };

    async componentDidMount() {
        await this._loadForm();
    }

    componentDidUpdate(prevProps, prevState) {
        Object.entries(this.props).forEach(([key, val]) =>
            prevProps[key] !== val && console.log(`F Prop '${key}' changed`)
        );
        Object.entries(this.state).forEach(([key, val]) =>
            prevState[key] !== val && console.log(`F State '${key}' changed`)
        );
        /* if (this.state.sectionChanged) {
         *     this.scrollView.scrollTo({ x: 0, y: 0, animated: true });
         *     this.setState({ sectionChanged: false });
         * } */
    }
    /* 
     *     componentDidUpdate() {
     *         if (this.state.sectionChanged) {
     *             this.scrollView.scrollTo({ x: 0, y: 0, animated: true });
     *             this.setState({ sectionChanged: false });
     *         }
     *     } */

    formGetPath(valuePath, default_ = null) {
        return this.props.formPaths[valuePath]
            ? this.props.formPaths[valuePath].value
            : default_;
    }

    formSetPath(valuePath, value) {
        this.props.formSetPath(valuePath, value);
        let current_section = this.state.formSections[this.state.currentSection];
        this.setState(state => {
            let newCache = _.clone(this.state.sectionCompletionStatusCache);
            newCache[this.state.currentSection] = isSectionComplete(
                current_section,
                path =>
                    // TODO This is pretty obscene.
                    // Clearly it's the wrongs solution.
                    path == valuePath ? value : this.formGetPath(path)
            );
            return { sectionCompletionStatusCache: newCache };
        });
    }

    renderFns = {
        pre: () => {
            return null;
        },
        post: (entry, obj, index, formPath, pre, inner, subparts) => {
            var title = null;
            var description = null;
            if (_.has(obj, "title")) {
                title = _.get(obj, "title");
            }
            if (_.has(obj, "description")) {
                description = (
                    <Text style={{ marginBottom: 10 }}>{_.get(obj, "description")}</Text>
                );
            }
            if (_.has(obj, "text")) {
                description = (
                    <Text style={{ marginBottom: 10 }}>{_.get(obj, "text")}</Text>
                );
            }
            return (
                <Card key={index} title={title}>
                    {description}
                    {inner}
                    {subparts}
                </Card>
            );
        },
        _combineParts: (entry, obj, index, inner, formPath, subparts) => {
            return <View>{subparts}</View>;
        },
        selectMultiple: (entry, obj, index, formPath, valuePaths, otherPath) => {
            if (_.get(obj, "field.select-multiple")) {
                let items = _.get(obj, "field.list-options").map((e, i) => {
                    let valuePath = valuePaths[i];
                    let fn = () => {
                        if (this.formGetPath(valuePath)) {
                            this.formSetPath(valuePath, false);
                        } else {
                            this.formSetPath(valuePath, true);
                        }
                    };
                    return (
                        <ListItem
                            key={i}
                            Component={TouchableOpacity}
                            title={_.upperFirst(e)}
                            checkBox={{
                                checked: this.formGetPath(valuePath),
                                onPress: fn
                            }}
                            onPress={fn}
                            containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}
                        />
                    );
                });
                if (_.get(obj, "field.other")) {
                    let fn = () => {
                        if (this.formGetPath(otherPath)) {
                            this.formSetPath(otherPath, null);
                        } else {
                            this.formSetPath(otherPath, "");
                        }
                    };
                    items.push(
                        <ListItem
                            Component={TouchableOpacity}
                            key={items.length}
                            title={"Other"}
                            checkBox={{
                                checked: this.formGetPath(otherPath) != null,
                                onPress: fn
                            }}
                            onPress={fn}
                            containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}
                        />
                    );
                }
                if (this.formGetPath(otherPath) != null) {
                    items.push(
                        <TextInput
                            key={items.length}
                            style={{
                                width: "100%",
                                height: 40,
                                maxHeight: 40000 /* TODO This limits the entry to ~1000 lines or so */,
                                borderColor: "gray",
                                borderBottomWidth: 1,
                                borderRadius: 5,
                                backgroundColor: "#F5F5F5"
                            }}
                            placeholder={"Specify other"}
                            textAlign={"left"}
                            editable={true}
                            multiline={true}
                            numberOfLines={5}
                            onChangeText={text => this.formSetPath(otherPath, text)}
                            value={this.formGetPath(otherPath, "")}
                        />
                    );
                }
                return <View>{items}</View>;
            } else {
                // TODO Error handling
                console.log("UNSUPPORTED FIELD TYPE LIST WITHOUT SELECT MUTLIPLE");
                console.log(obj);
                return null;
            }
        },
        signature: (entry, obj, index, formPath, valuePath) => {
            let icon = null;
            let title = null;
            let buttonStyle = {};
            let image = null;
            console.log(this.formGetPath(valuePath));
            if (this.formGetPath(valuePath)) {
                title = " Replace signature";
                image = (
                    <Image
                        resizeMode="contain"
                        style={{ width: 200, height: 200 }}
                        source={{ uri: this.formGetPath(valuePath) }}
                    />
                );
            } else {
                title = " Sign here";
                icon = <Icon name="edit" size={15} color="white" />;
                buttonStyle = { backgroundColor: "red" };
            }
            return (
                <View>
                    {image}
                    <Button
                        icon={icon}
                        title={title}
                        buttonStyle={buttonStyle}
                        onPress={() =>
                            this.props.navigation.navigate("Signature", {
                                signed: dataImage => this.formSetPath(valuePath, dataImage),
                                cancelSignature: () => this.formSetPath(valuePath, "")
                            })
                        }
                    />
                </View>
            );
        },
        "body-image": (entry, obj, index, formPath, valuePath) => {
            let title = null;
            let image = null;
            let icon = null;
            if (this.formGetPath(valuePath)) {
                title = " Update diagram";
                image = (
                    <Image
                        resizeMode="contain"
                        style={{ width: 200, height: 200 }}
                        source={{ uri: this.formGetPath(valuePath).image }}
                    />
                );
            } else {
                title = " Draw and comment";
                icon = <Icon name="edit" size={15} color="white" />;
                buttonStyle = { backgroundColor: "#d5001c" };
                image = (
                    <Image
                        resizeMode="contain"
                        style={{ width: 200, height: 200 }}
                        source={{
                            uri: this.state.files[_.get(obj, "field.generic-image")]
                        }}
                    />
                );
            }
            return (
                <View>
                    <View
                        style={{
                            justifyContent: "center",
                            flexDirection: "row",
                            marginBottom: 10
                        }}
                    >
                        {image}
                    </View>
                    <Button
                        icon={icon}
                        title={title}
                        buttonStyle={buttonStyle}
                        onPress={() =>
                            this.props.navigation.navigate("Body", {
                                baseImage: this.state.files[_.get(obj, "field.generic-image")],
                                /* TODO All of this is a placeholder */
                                enterData: (dataImage, lines, text) => {
                                    const value = this.formGetPath(valuePath);
                                    if (this.formGetPath(valuePath)) {
                                        this.formSetPath(valuePath, {
                                            image: dataImage,
                                            annotations: { [lines]: text }
                                        });
                                    } else {
                                        this.formSetPath(valuePath, {
                                            image: dataImage,
                                            annotations: _.clone(value.annotations)[lines] = text
                                        });
                                    }
                                },
                                cancel: () => this.formSetPath(valuePath, "")
                            })
                        }
                    />
                </View>
            );
        },
        bool: (entry, obj, index, formPath, valuePath) => {
            let selected = this.props.formPaths[valuePath]
                ? this.props.formPaths[valuePath].value
                    ? 0
                    : 1
                : null;
            return (
                <ButtonGroup
                    selectedIndex={selected}
                    onPress={i => this.formSetPath(valuePath, i == 0)}
                    buttons={["Yes", "No"]}
                />
            );
        },
        gender: (entry, obj, index, formPath, valuePath) => {
            let values = ["male", "female"];
            let selected = this.props.formPaths[valuePath]
                ? this.props.formPaths[valuePath].value == "male"
                    ? 0
                    : 1
                : null;
            return (
                <ButtonGroup
                    selectedIndex={selected}
                    onPress={i => this.formSetPath(valuePath, values[i])}
                    buttons={["Male", "Female"]}
                />
            );
        },
        text: (entry, obj, index, formPath, valuePath) => {
            return (
                <TextInput
                    style={{
                        width: "100%",
                        height: 40,
                        borderColor: "gray",
                        borderBottomWidth: 1,
                        borderRadius: 5,
                        backgroundColor: "#F5F5F5"
                    }}
                    placeholder={_.get(obj, "field.placeholder")}
                    textAlign={"center"}
                    editable={true}
                    onChangeText={text => this.formSetPath(valuePath, text)}
                    value={this.formGetPath(valuePath, "")}
                />
            );
        },
        "long-text": (entry, obj, index, formPath, valuePath) => {
            return (
                <TextInput
                    style={{
                        width: "100%",
                        minHeight: 40,
                        maxHeight: 40000 /* TODO This limits the entry to ~1000 lines or so */,
                        borderColor: "gray",
                        borderBottomWidth: 1,
                        borderRadius: 5,
                        backgroundColor: "#F5F5F5"
                    }}
                    placeholder={_.get(obj, "field.placeholder")}
                    textAlign={"left"}
                    editable={true}
                    multiline={true}
                    numberOfLines={5}
                    onChangeText={text => this.formSetPath(valuePath, text)}
                    value={this.formGetPath(valuePath, "")}
                />
            );
        },
        number: (entry, obj, index, formPath, valuePath) => {
            return (
                <TextInput
                    style={{
                        width: "100%",
                        height: 40,
                        borderColor: "gray",
                        borderBottomWidth: 1,
                        borderRadius: 5,
                        backgroundColor: "#F5F5F5"
                    }}
                    keyboardType={"numeric"}
                    textAlign={"center"}
                    editable={true}
                    placeholder={_.get(obj, "field.placeholder")}
                    onChangeText={text => this.formSetPath(valuePath, text)}
                    value={this.formGetPath(valuePath, "")}
                />
            );
        },
        address: (entry, obj, index, formPath, valuePath) => {
            return (
                <TextInput
                    style={{
                        width: "100%",
                        height: 40,
                        borderColor: "gray",
                        borderBottomWidth: 1,
                        borderRadius: 5,
                        backgroundColor: "#F5F5F5"
                    }}
                    textContentType={"fullStreetAddress"}
                    keyboardType={"default"}
                    textAlign={"center"}
                    editable={true}
                    placeholder={_.get(obj, "field.placeholder")}
                    onChangeText={text => this.formSetPath(valuePath, text)}
                    value={this.formGetPath(valuePath, "")}
                />
            );
        },
        "phone-number": (entry, obj, index, formPath, valuePath) => {
            return (
                <TextInput
                    style={{
                        width: "100%",
                        height: 40,
                        borderColor: "gray",
                        borderBottomWidth: 1,
                        borderRadius: 5,
                        backgroundColor: "#F5F5F5"
                    }}
                    textContentType={"telephoneNumber"}
                    keyboardType={"phone-pad"}
                    textAlign={"center"}
                    editable={true}
                    placeholder={_.get(obj, "field.placeholder")}
                    onChangeText={text => this.formSetPath(valuePath, text)}
                    value={this.formGetPath(valuePath, "")}
                />
            );
        },
        date: (entry, obj, index, formPath, valuePath) => {
            const current_value = this.formGetPath(valuePath);
            let buttonStyle = {};
            if (!current_value) {
                buttonStyle = { backgroundColor: "#d5001c" };
            }
            if (Platform.OS == "web") {
                return (
                    <DateTimePicker
                        clearIcon={null}
                        onChange={date => {
                            this.formSetPath(valuePath, date);
                        }}
                        disableClock={true}
                        onCancel={() =>
                            this.setState({
                                ["isVisible_dateTime_" + valuePath]: false
                            })
                        }
                    />
                );
            } else {
                return (
                    <>
                        <Button
                            title={
                                current_value
                                    ? current_value.toLocaleDateString()
                                    : "Choose date"
                            }
                            buttonStyle={buttonStyle}
                            onPress={() =>
                                this.setState({ ["isVisible_dateTime_" + valuePath]: true })
                            }
                        />
                        <DateTimePicker
                            isVisible={this.state["isVisible_dateTime_" + valuePath]}
                            onConfirm={date => {
                                this.formSetPath(valuePath, date);
                                this.setState({
                                    ["isVisible_dateTime_" + valuePath]: true
                                });
                            }}
                            onCancel={() =>
                                this.setState({
                                    ["isVisible_dateTime_" + valuePath]: false
                                })
                            }
                        />
                    </>
                );
            }
        },
        "date-time": (entry, obj, index, formPath, valuePath) => {
            const current_value = this.formGetPath(valuePath);
            let buttonStyle = {};
            if (!current_value) {
                buttonStyle = { backgroundColor: "#d5001c" };
            }
            if (Platform.OS == "web") {
                return (
                    <DateTimePicker
                        clearIcon={null}
                        onChange={date => {
                            this.formSetPath(valuePath, date);
                        }}
                        onCancel={() =>
                            this.setState({
                                ["isVisible_dateTime_" + valuePath]: false
                            })
                        }
                    />
                );
            } else {
                return (
                    <>
                        <Button
                            title={
                                current_value
                                    ? current_value.toLocaleString()
                                    : "Choose date and time"
                            }
                            buttonStyle={buttonStyle}
                            onPress={() =>
                                this.setState({ ["isVisible_dateTime_" + valuePath]: true })
                            }
                        />
                        <DateTimePicker
                            isVisible={this.state["isVisible_dateTime_" + valuePath]}
                            onConfirm={date => {
                                this.formSetPath(valuePath, date);
                                this.setState({
                                    ["isVisible_dateTime_" + valuePath]: true
                                });
                            }}
                            mode="datetime"
                            onCancel={() =>
                                this.setState({
                                    ["isVisible_dateTime_" + valuePath]: false
                                })
                            }
                        />
                    </>
                );
            }
        },
        "list-with-labels": (entry, obj, index, formPath, valuePath) => {
            let options = _.get(obj, "field.list-options");
            const ref = _.get(obj, "field.list-options.Ref");
            if (ref) {
                // TODO Error handling
                options = _.find(this.state.form.values, o => ref == o.key).value;
            }
            let items = options.map((e, i) => {
                return (
                    <Picker.Item
                        key={i}
                        label={e.key + " (" + e.value + ")"}
                        value={e.value}
                    />
                );
            });
            const current_value = this.formGetPath(valuePath);
            if (!current_value) {
                items = [
                    <Picker.Item key={-1} label="Select a value" value={null} />
                ].concat(items);
            }
            return (
                <Picker
                    prompt={_.get(obj, "title")}
                    selectedValue={current_value == null ? -1 : current_value}
                    style={{ height: 50, width: "100%" }}
                    onValueChange={(itemValue, itemIndex) => {
                        if (itemValue != null) {
                            this.formSetPath(valuePath, itemValue);
                        }
                    }}
                >
                    {items}
                </Picker>
            );
        }
    };

    render() {
        console.log("RENDER");
        let sectionContent = [];
        if (this.state.formSections) {
            let current_section = this.state.formSections[this.state.currentSection];
            sectionContent = mapSectionWithPaths(
                current_section,
                path => this.formGetPath(path),
                this.renderFns
            );
        }
        return (
            <View style={styles.container}>
                <SideMenu
                    ref={ref => (this.sideMenu = ref)}
                    menu={
                        <Menu
                            navigator={navigator}
                            formSections={this.state.formSections}
                            changeSection={i => {
                                this.setState({ currentSection: i });
                                this.scrollView.scrollTo({ x: 0, y: 0, animated: true });
                            }}
                            isSectionComplete={i => {
                                return (
                                    this.state.sectionCompletionStatusCache &&
                                    this.state.sectionCompletionStatusCache[i]
                                );
                            }}
                        />
                    }
                >
                    <Header
                        leftComponent={{
                            icon: "menu",
                            color: "#fff",
                            onPress: () => {
                                Keyboard.dismiss();
                                this.sideMenu.openMenu(true);
                            }
                        }}
                        centerComponent={
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <Button
                                    title=""
                                    icon={<Icon name="arrow-back" size={15} color="white" />}
                                    disabled={this.state.currentSection == 0}
                                    onPress={() => {
                                        this.setState({
                                            sectionChanged: true,
                                            currentSection: this.state.currentSection - 1
                                        });
                                    }}
                                />
                                <Text
                                    style={{
                                        width: "60%",
                                        marginLeft: "10%",
                                        marginRight: "10%",
                                        color: "#fff"
                                    }}
                                    textAlign="center"
                                >
                                    Section {this.state.currentSection + 1}
                                    {"\n"}
                                    {this.state.formSections
                                        ? this.state.formSections[this.state.currentSection].title
                                        : ""}
                                </Text>
                                <Button
                                    title=""
                                    disabled={
                                        this.state.formSections &&
                                        this.state.currentSection ==
                                        this.state.formSections.length - 1
                                    }
                                    onPress={() => {
                                        this.setState({
                                            sectionChanged: true,
                                            currentSection: this.state.currentSection + 1
                                        });
                                    }}
                                    icon={<Icon name="arrow-forward" size={15} color="white" />}
                                    iconRight
                                />
                            </View>
                        }
                        rightComponent={
                            // TODO Change this to a submit button
                            { text: "30%", style: { color: "#fff" } }
                        }
                        containerStyle={{
                            backgroundColor:
                                this.state.sectionCompletionStatusCache &&
                                    this.state.sectionCompletionStatusCache[
                                    this.state.currentSection
                                    ]
                                    ? "#1cd500"
                                    : "#d5001c",
                            justifyContent: "space-around"
                        }}
                    />
                    <ScrollView
                        ref={ref => (this.scrollView = ref)}
                        style={{ flex: 10, backgroundColor: "#fff" }}
                        keyboardDismissMode="on-drag"
                        accessible={false}
                        onScroll={() => {
                            Keyboard.dismiss();
                        }}
                        keyboardShouldPersistTaps="handled"
                    >
                        {sectionContent}
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
                                    disabled={this.state.currentSection == 0}
                                    onPress={() => {
                                        this.setState({
                                            sectionChanged: true,
                                            currentSection: this.state.currentSection - 1
                                        });
                                    }}
                                />
                                <Button
                                    title="Next section "
                                    disabled={
                                        this.state.formSections &&
                                        this.state.currentSection ==
                                        this.state.formSections.length - 1
                                    }
                                    onPress={() => {
                                        this.setState({
                                            sectionChanged: true,
                                            currentSection: this.state.currentSection + 1
                                        });
                                    }}
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
                    </ScrollView>
                </SideMenu>
            </View>
        );
    }
}

export default connect(
    state => {
        return { formId: state.form.formId, formPaths: state.form.formPaths };
    },
    { formSetPath }
)(Form);
