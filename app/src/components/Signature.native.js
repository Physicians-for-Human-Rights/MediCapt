import React, { useRef } from "react";
import { StyleSheet, View } from "react-native"
import { Button } from "react-native-elements";
import styles_ from "../styles";
// https://www.npmjs.com/package/react-native-signature-canvas
import SignatureCanvas from "react-native-signature-canvas";

const Signature = props => {
    const canvasWebStyle = `.m-signature-pad {box-shadow: none; border: none; } 
                            .m-signature-pad--body {border: none;}
                            .m-signature-pad--footer {display: none; margin: 0px;}
                            body,html {
                                width: 100%; height: 100%;}`;

    const canvasRef = useRef();

    return (
        <View style={styles_.container}>
            <View style={styles.sketchContainer}>
                <SignatureCanvas
                    webStyle={canvasWebStyle}
                    ref={canvasRef}
                    onOK={(signature) => props.onSubmit(signature)}
                    onEmpty={props.onCancel}
                />
            </View>
            <View style={styles.buttonsContainer}>
                <Button
                    title="Submit signature"
                    style={styles.button}
                    onPress={() => canvasRef.current.readSignature()}
                />
                <Button
                    title="Don't sign"
                    buttonStyle={{ backgroundColor: "#d5001c" }}
                    style={styles.button}
                    onPress={props.onCancel}
                />
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    sketchContainer: {
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
    }
});

export default Signature;