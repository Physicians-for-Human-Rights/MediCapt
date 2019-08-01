import Expo from "expo";
import * as ExpoPixi from "expo-pixi";
import React, { Component } from "react";
import { Platform, AppState, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, NavigationScreenProps } from "react-navigation";
import { Header, Button } from "react-native-elements";
import styles_ from "../styles";
import * as FileSystem from "expo-file-system";

const isAndroid = Platform.OS === "android";
function uuidv4() {
    //https://stackoverflow.com/a/2117523/4047926
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export default class App extends Component {
    state = {
        strokeColor: 0,
        appState: AppState.currentState,
        changed: false
    };
    static navigationOptions = {
        title: "Sign anywhere below",
        header: null
    };

    handleAppStateChangeAsync = nextAppState => {
        if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            if (isAndroid && this.sketch) {
                this.setState({
                    appState: nextAppState,
                    id: uuidv4(),
                    lines: this.sketch.lines
                });
                return;
            }
        }
        this.setState({ appState: nextAppState });
    };

    componentDidMount() {
        AppState.addEventListener("change", this.handleAppStateChangeAsync);
    }

    componentWillUnmount() {
        AppState.removeEventListener("change", this.handleAppStateChangeAsync);
    }

    onReady = () => {
        console.log("ready!");
    };

    onChange = async () => {
        this.setState({ changed: true });
    };

    onSubmit = async () => {
        if (this.state.changed) {
            const { uri } = await this.sketch.takeSnapshotAsync({
                format: "png"
            });
            let res = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64
            });
            this.props.navigation.state.params.signed("data:image/png;base64," + res);
            this.props.navigation.goBack();
        } else {
            this.onCancel();
        }
    };

    onCancel = () => {
        this.props.navigation.state.params.cancelSignature();
        this.props.navigation.goBack();
    };

    render() {
        return (
            <View style={styles_.container}>
                <Header
                    centerComponent={{
                        text: "Sign anywhere below",
                        style: { color: "#fff" }
                    }}
                    containerStyle={{
                        backgroundColor: "#d5001c",
                        justifyContent: "space-around"
                    }}
                />
                <View style={styles.container}>
                    <View style={styles.sketchContainer}>
                        <ExpoPixi.Signature
                            ref={ref => (this.sketch = ref)}
                            style={styles.sketch}
                            strokeColor={"blue"}
                            strokeAlpha={1}
                            onChange={this.onChange}
                            onReady={this.onReady}
                        />
                    </View>
                </View>
                <View
                    style={{
                        flex: 0.2,
                        flexDirection: "row",
                        justifyContent: "space-around",
                        alignItems: "center",
                        backgroundColor: "#EDEDED",
                        width: "100%"
                    }}
                >
                    <Button
                        title="Submit signature"
                        style={styles.button}
                        onPress={this.onSubmit}
                    />
                    <Button
                        title="Don't sign"
                        buttonStyle={{ backgroundColor: "#d5001c" }}
                        style={styles.button}
                        onPress={this.onCancel}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%"
    },
    sketch: {
        flex: 1
    },
    sketchContainer: {
        height: "100%"
    },
    label: {
        width: "100%",
        padding: 5,
        alignItems: "center"
    },
    button: {
        // position: 'absolute',
        // bottom: 8,
        // left: 8,
        zIndex: 1,
        padding: 12,
        minWidth: 56,
        minHeight: 48
    }
});