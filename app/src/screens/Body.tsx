import Expo from "expo";
import * as ExpoPixi from "expo-pixi";
import React, { Component } from "react";
import {
    ImageBackground,
    Platform,
    AppState,
    StyleSheet,
    Text,
    View,
    Image
} from "react-native";
import { SafeAreaView, NavigationScreenProps } from "react-navigation";
import { Header, Button, ButtonGroup } from "react-native-elements";
import styles_ from "../styles";
import BodySketch from "../components/BodySketch";
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

export default class Body extends Component {
    state = {
        strokeColor: 0,
        appState: AppState.currentState,
        changed: false,
        toolMode: 0
    };
    static navigationOptions = {
        title: "Draw and comment on diagram",
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
            this.props.navigation.state.params.enterData(
                "data:image/png;base64," + res
            );
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
                        text: "Draw and comment on diagram",
                        style: { color: "#fff" }
                    }}
                    containerStyle={{
                        backgroundColor: "#d5001c",
                        justifyContent: "space-around"
                    }}
                />
                <ButtonGroup
                    selectedIndex={this.state.toolMode}
                    onPress={i => this.setState({ toolMode: i })}
                    buttons={["Draw line", "Draw point", "Select"]}
                />
                <View style={styles.container}>
                    <View style={styles.sketchContainer}>
                        <ImageBackground
                            style={{ width: "100%", height: "100%" }}
                            imageStyle={{ resizeMode: "contain" }}
                            source={{ uri: this.props.navigation.state.params.baseImage }}
                        >
                            <BodySketch
                                baseImage={this.props.navigation.state.params.baseImage}
                                ref={ref => (this.sketch = ref)}
                                style={styles.sketch}
                                strokeColor={0x0000ff}
                                strokeAlpha={1}
                                toolMode={
                                    this.state.toolMode
                                        ? ["draw-line", "draw-point", "elect"][this.state.toolMode]
                                        : null
                                }
                                onChange={this.onChange}
                                onReady={this.onReady}
                                onSelect={this.onSelect}
                            />
                        </ImageBackground>
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
                        title="Submit drawing"
                        style={styles.button}
                        onPress={this.onSubmit}
                    />
                    <Button
                        title="Don't submit"
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
        height: "100%",
        zIndex: 1
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
