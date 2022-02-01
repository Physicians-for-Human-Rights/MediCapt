import React, { useState } from "react";
import { StyleSheet, View } from "react-native"
import { Header } from "react-native-elements";
import styles_ from "../styles";
import SignatureComponent from "../components/Signature";


const SignatureNew = props => {

    const onCancel = () => {
        props.navigation.state.params.cancelSignature();
        props.navigation.goBack();
    };

    const onSubmit = (signature: string) => {
        props.navigation.state.params.signed(signature);
        props.navigation.goBack();
    }

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
                <SignatureComponent onSubmit={onSubmit} onCancel={onCancel} />
            </View>
        </View>
    );
};

SignatureNew['navigationOptions'] = screenProps => ({
    title: "Sign anywhere below",
    header: null
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%"
    }
});

export default SignatureNew;