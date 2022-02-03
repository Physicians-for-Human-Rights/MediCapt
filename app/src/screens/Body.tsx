import React, { useState } from "react";
import {
    StyleSheet,
    View
} from "react-native";
import { Header, Button } from "react-native-elements";
import styles_ from "../styles";
import BodyMarker from "../components/BodyMarker";
import Dialog from "../components/Dialog";

const Body = props => {
    const [annotations, setAnnotations] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState(null);

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

    // callback for dialog to add finalized annotation with marker
    const confirmAnnotation = text => {
        setAnnotations(prev => 
            [...prev, {markerCoordinates: selectedMarker, description: text}]
        );
        setSelectedMarker(null);
    }

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
                <BodyMarker
                    baseImage={props.navigation.state.params.baseImage}
                    confirmMarker={marker => setSelectedMarker(marker)}
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

            <Dialog
                visible={selectedMarker !== null}
                title="Annotation"
                description="Please add any comments on the annotation."
                handleCancel={() => setSelectedMarker(null)}
                handleConfirm={confirmAnnotation}
            />
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