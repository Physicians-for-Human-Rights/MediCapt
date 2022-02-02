import React, { useState } from "react";
import {
    StyleSheet,
    View
} from "react-native";
import { Header, Button } from "react-native-elements";
import styles_ from "../styles";

import BodyAnnotate from "../components/BodyAnnotate";

const Body = props => {

    const [annotations, setAnnotations] = useState([]);

    const onSubmit = async () => {
        props.navigation.state.params.enterData(
            props.navigation.state.params.baseImage, 
            annotations
        );
        props.navigation.goBack();
    };

    const onCancel = () => {
        props.navigation.goBack();
    };

    const addAnnotation = newAnnotation => {
        setAnnotations(prev => [...prev, newAnnotation]);
    };

    return (
        <View style={styles_.container}>
            <Header
                centerComponent={{
                    text: "Mark and annotate diagram",
                    style: { color: "#fff" }
                }}
                containerStyle={styles.headerContainer}
            />
            <View style={styles.annotationContainer}>
                <BodyAnnotate
                    baseImage={props.navigation.state.params.baseImage}
                    addAnnotation={addAnnotation}
                    annotations={annotations}
                />
            </View>
            <View style={styles.buttonsContainer}>
                <Button
                    title="Submit drawing"
                    style={styles.button}
                    onPress={onSubmit}
                />
                <Button
                    title="Don't submit"
                    buttonStyle={{ backgroundColor: "#d5001c" }}
                    style={styles.button}
                    onPress={onCancel}
                />
            </View>
        </View>
    );
};

Body['navigationOptions'] = screenProps => ({
    title: "Mark and annotate diagram",
    header: null
})

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: "#d5001c",
        justifyContent: "space-around",
        width: "100%"
    },
    annotationContainer: {
        flex: 1,
        width: "100%"
    },
    buttonsContainer: {
        flex: 0.2,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#EDEDED",
        width: "100%"
    },
    button: {
        zIndex: 1,
        padding: 12,
        minWidth: 56,
        minHeight: 48
    },
});

export default Body;