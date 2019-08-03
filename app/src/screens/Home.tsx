import React from "react";
import { ActivityIndicator, Text, Image, View } from "react-native";
import { SafeAreaView, NavigationScreenProps } from "react-navigation";
import { Icon, Button } from "react-native-elements";

import { Auth } from "aws-amplify";

import medicapt_logo from "../../assets/medicapt.png";
import phr_logo from "../../assets/phr.png";
import styles from "../styles";

import { connect } from "react-redux";

type Props = NavigationScreenProps;

class ButtonWithIconBackground extends React.Component<Props> {
    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ zIndex: 1 }}>
                    <Button
                        title={this.props.label}
                        containerViewStyle={{
                            image: "imgUrl('../../assets/medicapt.png')"
                        }}
                        onPress={this.props.onPress}
                        buttonStyle={styles.largeTileButton}
                        titleStyle={{ color: "#d5001c" }}
                        type="outline"
                    />
                </View>
                <View style={{ zIndex: 0, position: "absolute" }}>
                    <Button
                        onPress={this.props.onPress}
                        buttonStyle={styles.largeTileButton}
                        titleStyle={{ color: "#d5001c" }}
                        type="outline"
                        icon={
                            <Icon
                                name={this.props.iconName}
                                type={this.props.iconType}
                                size={100}
                                color="#0039d515"
                            />
                        }
                    />
                </View>
            </View>
        );
    }
}

class HomeScreen extends React.Component<Props> {
    static navigationOptions = {
        title: "Medicapt",
        header: null
    };

    componentDidMount() {
        // TODO Debugging
        this.props.navigation.navigate("SelectForm");
    }

    render() {
        return (
            <SafeAreaView forceInset={{ top: "always" }} style={styles.container}>
                <View
                    style={{
                        justifyContent: "space-around",
                        flex: 2,
                        flexDirection: "row"
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Image source={medicapt_logo} style={styles.logo} />
                    </View>
                    <View style={{ flex: 1 }}>
                        {/* <Text>Hello</Text> */}
                        <Image source={phr_logo} style={styles.logo} />
                    </View>
                </View>
                <View
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center"
                    }}
                >
                    <View>
                        <Text style={styles.welcomeText}>
                            {" "}
                            {this.props.user.user.attributes.name}{" "}
                        </Text>
                    </View>
                </View>
                <View style={{ flex: 4 }}>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            minWidth: "80%"
                        }}
                    >
                        <ButtonWithIconBackground
                            label="Create new record"
                            onPress={this._createNewRecord}
                            iconName="plus"
                            iconType="foundation"
                        />
                        <View style={{ flex: 0.4 }} />
                        <ButtonWithIconBackground
                            label="Incomplete records"
                            onPress={this._incompleteRecords}
                            iconName="pencil"
                            iconType="foundation"
                        />
                    </View>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <ButtonWithIconBackground
                            label="Find record"
                            onPress={this._findRecord}
                            iconName="search"
                            iconType="font-awesome"
                        />
                        <View style={{ flex: 0.4 }} />
                        <ButtonWithIconBackground
                            label="Settings"
                            onPress={this._loadSettings}
                            iconName="cog"
                            iconType="font-awesome"
                        />
                    </View>
                </View>
                <View
                    style={{
                        flex: 0.6,
                        flexDirection: "row",
                        alignItems: "center"
                    }}
                >
                    <View style={{ marginRight: 30 }}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                    <View>
                        <Text style={styles.syncText}>Synchronizing 3 records</Text>
                    </View>
                </View>
                <View style={styles.sideBySideButtons}>
                    <View style={styles.simpleButton}>
                        <Button
                            raised
                            title="Log out everywhere"
                            onPress={this._signOutAsyncEverywhere}
                        />
                    </View>
                    <View style={styles.simpleButton}>
                        <Button raised title="Log out" onPress={this._signOutAsync} />
                    </View>
                </View>
            </SafeAreaView>
        );
    }
    _createNewRecord = () => {
        this.props.navigation.navigate("SelectForm");
    };
    _incompleteRecords = () => {
        this.props.navigation.navigate("Other");
    };
    _findRecord = () => {
        this.props.navigation.navigate("Other");
    };
    _loadSettings = () => {
        this.props.navigation.navigate("Other");
    };
    _signOutAsync = async () => {
        Auth.signOut()
            .then(data => this.props.navigation.navigate("Authentication"))
            .catch(err => {
                console.log(err);
                this.props.navigation.navigate("Authentication");
            }); // TODO What else can we do on error?
    };
    _signOutAsyncEverywhere = async () => {
        Auth.signOut({ global: true })
            .then(data => this.props.navigation.navigate("Authentication"))
            .catch(err => {
                console.log(err);
                this.props.navigation.navigate("Authentication");
            }); // TODO What else can we do on error?
    };
}

export default connect(state => {
    return { user: state.user };
})(HomeScreen);
