import React from "react";
import {
    Platform,
    ActivityIndicator,
    StatusBar,
    Button,
    StyleSheet,
    Text,
    View
} from "react-native";
import {
    createSwitchNavigator,
    createAppContainer,
    SafeAreaView
} from "react-navigation";
import { createStackNavigator, NavigationStackScreenProps } from 'react-navigation-stack';
import { ThemeProvider } from "react-native-elements";

import Amplify from "aws-amplify";
import { Auth } from "aws-amplify";
import config from "./config.js";

import { Provider } from "react-redux";
import store from "./src/redux/store";

import withAuthenticator from "./src/screens/Authentication";

import FormScreen from "./src/screens/Form";
import SignatureScreen from "./src/screens/Signature";
import FormOverviewScreen from "./src/screens/FormOverview";
import SelectFormScreen from "./src/screens/SelectForm";
import HomeScreen from "./src/screens/Home";
import BodyScreen from "./src/screens/Body";

import AsyncStorage from '@react-native-async-storage/async-storage';

import theme from "./src/theme";

let dataMemory = {};

function stackTrace() {
    var err = new Error();
    return err.stack;
}

Amplify.configure({
    Auth: {
        mandatorySignIn: true,
        region: config.cognito.REGION,
        userPoolId: config.cognito.USER_POOL_ID,
        identityPoolId: config.cognito.IDENTITY_POOL_ID,
        userPoolWebClientId: config.cognito.APP_CLIENT_ID,
    },
    Analytics: {
        disabled: true
    },
    Storage: {
        region: "us-east-1",
        bucket: "medicapt-records-dev"
    },
    API: {
        endpoints: [
            {
                name: "provider",
                endpoint: config.apiGateway.provider.URL,
                region: config.apiGateway.provider.REGION
            }
        ]
    }
});

type Props = NavigationStackScreenProps;

class OtherScreen extends React.Component<Props> {
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
    _signOutAsync = async () => {
        Auth.signOut()
            .then(data => this.props.navigation.navigate("Authentication"))
            .catch(err => this.props.navigation.navigate("Authentication")); // TODO What else can we do?
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }
});

const AppContainer =
    createAppContainer(createStackNavigator(
        {
            Home: HomeScreen,
            Body: BodyScreen,
            Other: OtherScreen,
            FormOverview: FormOverviewScreen,
            SelectForm: SelectFormScreen,
            Form: FormScreen,
            Signature: SignatureScreen
        },
        {
            initialRouteName: 'Home',
        }
    ));

function App() {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <AppContainer />
            </ThemeProvider>
        </Provider>
    );
}

export default withAuthenticator(App);
