import React from "react";
import {
    Platform,
    ActivityIndicator,
    StatusBar,
    AsyncStorage,
    Button,
    StyleSheet,
    Text,
    View
} from "react-native";
import {
    createStackNavigator,
    createSwitchNavigator,
    createAppContainer,
    SafeAreaView,
    NavigationScreenProps
} from "react-navigation";
import { ThemeProvider } from "react-native-elements";

import Amplify from "aws-amplify";
import { Auth } from "aws-amplify";
import config from "./config.js";

import { Provider } from "react-redux";
import store from "./src/redux/store";

import Authentication from "./src/screens/Authentication";
import FormScreen from "./src/screens/Form";
import SignatureScreen from "./src/screens/Signature";
import FormOverviewScreen from "./src/screens/FormOverview";
import SelectFormScreen from "./src/screens/SelectForm";
import HomeScreen from "./src/screens/Home";

import theme from "./src/theme";

Amplify.configure({
    Auth: {
        mandatorySignIn: true,
        region: config.cognito.REGION,
        userPoolId: config.cognito.USER_POOL_ID,
        identityPoolId: config.cognito.IDENTITY_POOL_ID,
        userPoolWebClientId: config.cognito.APP_CLIENT_ID
    },
    Analytics: {
        disabled: true
    },
    API: {
        endpoints: [
            {
                name: "records",
                endpoint: config.apiGateway.URL,
                region: config.apiGateway.REGION
            }
        ]
    },
    Storage: {
        AWSS3: {
            bucket: config.s3.BUCKET,
            region: config.s3.REGION
        }
    }
});

type Props = NavigationScreenProps;

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

const AppStack = createStackNavigator({
    Home: HomeScreen,
    Other: OtherScreen,
    FormOverview: FormOverviewScreen,
    SelectForm: SelectFormScreen,
    Form: FormScreen,
    Signature: SignatureScreen
});

const AppContainer = createAppContainer(
    createSwitchNavigator(
        {
            Authentication: Authentication,
            App: AppStack
        },
        {
            initialRouteName: "Authentication"
        }
    )
);

export default class App extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <ThemeProvider theme={theme}>
                    <AppContainer />
                </ThemeProvider>
            </Provider>
        );
    }
}
