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
    Keyboard
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
import DateTimePicker from "react-native-modal-datetime-picker";

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
                if (getValue(_.get(obj, "only-when.path")) != _.has(obj, "only-when.value"))
                    return null;
            }
            let pre = fns.pre && fns.pre(entry, obj, index, formPath);
            if (_.has(obj, "field.type")) {
                switch (_.get(obj, "field.type")) {
                    case "list":
                        if (_.get(obj, "field.select-multiple")) {
                            inner = fns.selectMultiple(entry,
                                obj,
                                index,
                                formPath,
                                _.get(obj, "field.list-options").map((e, i) => { return formPath + ".field.value." + i; }))
                        } else {
                            console.log(
                                "UNSUPPORTED FIELD TYPE LIST WITHOUT SELECT MUTLIPLE"
                            );
                            console.log(obj);
                        }
                        break;
                    case "signature":
                        inner = fns.signature(entry, obj, index, formPath, formPath + ".field.value");
                        break;
                    case "bool":
                        inner = fns.bool(entry, obj, index, formPath, formPath + ".field.value");
                        break;
                    case "gender":
                        inner = fns.gender(entry, obj, index, formPath, formPath + ".field.value");
                        break;
                    case "text":
                        inner = fns.text(entry, obj, index, formPath, formPath + ".field.value");
                        break;
                    case "number":
                        inner = fns.number(entry, obj, index, formPath, formPath + ".field.value");
                        break;
                    case "date":
                        inner = fns.date(entry, obj, index, formPath, formPath + ".field.value");
                        break;
                    case "date-time":
                        inner = fns.dateTime(entry, obj, index, formPath, formPath + ".field.value");
                        break;
                    default:
                        console.log("UNSUPPORTED FIELD TYPE");
                        console.log(obj);
                        break;
                }
            }
            let subparts = null;
            if (_.has(obj, "parts")) {
                subparts = fns._combineParts(entry, obj, index, formPath, inner, process(obj.parts, 0, formPath + ".parts"));
            }
            return fns.post(entry, obj, index, formPath, pre, inner, subparts);
        }
    }
    return process(section.content.parts, 0, "root." + section.name);
}

function allFormValuePathsForSection(section, getValue) {
    let allValuePaths = [];
    mapSectionWithPaths(section, getValue,
        {
            selectMultiple: (entry, obj, index, formPath, valuePaths) => allValuePaths = allValuePaths.concat(valuePaths),
            signature: (entry, obj, index, formPath, valuePath) => allValuePaths.push(valuePath),
            bool: (entry, obj, index, formPath, valuePath) => allValuePaths.push(valuePath),
            gender: (entry, obj, index, formPath, valuePath) => allValuePaths.push(valuePath),
            text: (entry, obj, index, formPath, valuePath) => allValuePaths.push(valuePath),
            number: (entry, obj, index, formPath, valuePath) => allValuePaths.push(valuePath),
            date: (entry, obj, index, formPath, valuePath) => allValuePaths.push(valuePath),
            dateTime: (entry, obj, index, formPath, valuePath) => allValuePaths.push(valuePath),
            _combineParts: (entry, obj, index, inner, outer) => null,
            post: (entry, obj, index, formPath, pre, inner, subparts) => null
        })
    return allValuePaths;
}

function isSectionComplete(section, getValue) {
    let complete = true;
    mapSectionWithPaths(section, getValue,
        {
            selectMultiple: (entry, obj, index, formPath, valuePaths) =>
                // NB This checks not that getValue exists, but that at least one of them is also true.
                complete = complete && _.some(valuePaths, (x) => getValue(x)),
            signature: (entry, obj, index, formPath, valuePath) => complete = complete && (getValue(valuePath) != null),
            bool: (entry, obj, index, formPath, valuePath) => complete = complete && (getValue(valuePath) != null),
            gender: (entry, obj, index, formPath, valuePath) => complete = complete && (getValue(valuePath) != null),
            text: (entry, obj, index, formPath, valuePath) => complete = complete && (getValue(valuePath) != null),
            number: (entry, obj, index, formPath, valuePath) => complete = complete && (getValue(valuePath) != null),
            date: (entry, obj, index, formPath, valuePath) => complete = complete && (getValue(valuePath) != null),
            dateTime: (entry, obj, index, formPath, valuePath) => complete = complete && (getValue(valuePath) != null),
            _combineParts: (entry, obj, index, inner, outer) => null,
            post: (entry, obj, index, formPath, pre, inner, subparts) => null
        })
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
            form: null,
            formSections: null,
            currentSection: 0,
            sectionChanged: false,
            // NB Recomputing this each update introduces noticeable lag.
            sectionCompletionStatusCache: []
        };
    }

    _loadForm = async () => {
        // TODO Error handling
        let f = Asset.fromModule(allForms[this.props.formId.path]["form.yaml"]);
        await f.downloadAsync();
        let res = await FileSystem.readAsStringAsync(f.localUri);
        let form = yaml.load(res);
        let formSections = form.root.map(e => {
            return {
                name: Object.keys(e)[0],
                title: e[Object.keys(e)[0]].title,
                content: e[Object.keys(e)[0]]
            };
        });
        this.setState({ form: form, formSections: formSections, sectionCompletionStatusCache: formSections.map(() => false) });
    };

    async componentDidMount() {
        await this._loadForm();
    }

    componentDidUpdate() {
        if (this.state.sectionChanged) {
            this.scrollView.scrollTo({ x: 0, y: 0, animated: true });
            this.setState({ sectionChanged: false });
        }
    }

    formGetPath(valuePath) {
        return this.props.formPaths[valuePath]
            ? this.props.formPaths[valuePath].value
            : null;
    }

    formSetPath(valuePath, value) {
        this.props.formSetPath(valuePath, value);
        let current_section = this.state.formSections[this.state.currentSection];
        this.setState(state => {
            let newCache = _.clone(this.state.sectionCompletionStatusCache)
            newCache[this.state.currentSection] =
                isSectionComplete(current_section,
                    (path) =>
                        // TODO This is pretty obscene.
                        // Clearly it's the wrongs solution.
                        (path == valuePath) ?
                            value :
                            this.formGetPath(path));
            return { sectionCompletionStatusCache: newCache }
        })
    }

    renderFns = {
        pre: () => { return null },
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
            return <View>{subparts}</View>
        },
        selectMultiple: (entry, obj, index, formPath, valuePaths) => {
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
                return <View>{items}</View>;
            } else {
                // TODO Error handling
                console.log(
                    "UNSUPPORTED FIELD TYPE LIST WITHOUT SELECT MUTLIPLE"
                );
                console.log(obj);
                return null;
            }
        },
        signature: (entry, obj, index, formPath, valuePath) => {
            let icon = null;
            let title = null;
            let buttonStyle = {};
            let image = null;
            if (this.formGetPath(valuePath)) {
                title = " Update signature";
                return (
                    <Image
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
                                signed: dataImage =>
                                    this.formSetPath(valuePath, dataImage),
                                cancelSignature: () =>
                                    this.formSetPath(valuePath, "")
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
                        borderWidth: 1,
                        backgroundColor: "#DCDCDC"
                    }}
                    textAlign={"center"}
                    editable={true}
                    onChangeText={text => this.formSetPath(valuePath, text)}
                    value={this.formGetPath(valuePath)}
                />
            )
        },
        number: (entry, obj, index, formPath, valuePath) => {
            return (
                <TextInput
                    style={{
                        width: "100%",
                        height: 40,
                        borderColor: "gray",
                        borderWidth: 1,
                        backgroundColor: "#DCDCDC"
                    }}
                    keyboardType={"numeric"}
                    textAlign={"center"}
                    editable={true}
                    onChangeText={text => this.formSetPath(valuePath, text)}
                    value={this.formGetPath(valuePath)}
                />
            );
        },
        date: (entry, obj, index, formPath, valuePath) => {
            return (
                <>
                    <Button
                        title={
                            this.formGetPath(valuePath)
                                ? this.formGetPath(valuePath).toLocaleDateString()
                                : "Choose date"
                        }
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
        },
        dateTime: (entry, obj, index, formPath, valuePath) => {
            return (
                <>
                    <Button
                        title={
                            this.formGetPath(valuePath)
                                ? this.formGetPath(valuePath).toLocaleString()
                                : "Choose date and time"
                        }
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
    }

    render() {
        let sectionContent = [];
        if (this.state.formSections) {
            let current_section = this.state.formSections[this.state.currentSection];
            sectionContent = mapSectionWithPaths(
                current_section,
                (path) => this.formGetPath(path),
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
                                return (this.state.sectionCompletionStatusCache && this.state.sectionCompletionStatusCache[i]);
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
                            <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center" }}>
                                <Button
                                    title=""
                                    icon={<Icon name="arrow-back" size={15} color="white" />}
                                    disabled={this.state.currentSection == 0}
                                    onPress={() => {
                                        this.setState({
                                            sectionChanged: true,
                                            currentSection: this.state.currentSection - 1
                                        })
                                    }}
                                />
                                <Text style={{ width: '60%', marginLeft: '10%', marginRight: '10%', color: "#fff" }} textAlign="center">
                                    Section {this.state.currentSection + 1}{"\n"}{this.state.formSections ? this.state.formSections[this.state.currentSection].title : ""}
                                </Text>
                                <Button
                                    title=""
                                    disabled={this.state.formSections && this.state.currentSection == this.state.formSections.length - 1}
                                    onPress={() => {
                                        this.setState({
                                            sectionChanged: true,
                                            currentSection: this.state.currentSection + 1
                                        })
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
                            backgroundColor: (this.state.sectionCompletionStatusCache &&
                                this.state.sectionCompletionStatusCache[this.state.currentSection]) ? "#1cd500" : "#d5001c",
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
                                        })
                                    }}
                                />
                                <Button
                                    title="Next section "
                                    disabled={this.state.formSections && this.state.currentSection == this.state.formSections.length - 1}
                                    onPress={() => {
                                        this.setState({
                                            sectionChanged: true,
                                            currentSection: this.state.currentSection + 1
                                        })
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