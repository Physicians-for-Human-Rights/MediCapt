import React, { useRef, useState, useEffect, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-elements";
import styles_ from "../styles";
// https://www.npmjs.com/package/react-signature-pad-wrapper
import SignatureCanvas from "react-signature-pad-wrapper";

const Signature = props => {
    // code for correctly rendering SignatureCanvas size within it's container
    const canvasContainerRef = useRef();
    const [canvasHeight, setCanvasHeight] = useState();

    const getCanvasSize = () => {
        const newHeight = canvasContainerRef.current.clientHeight;
        setCanvasHeight(newHeight);
    };

    useEffect(() => {
        getCanvasSize();
    });
    useEffect(() => {
        window.addEventListener("resize", getCanvasSize);
        return () => {
            window.removeEventListener("resize", getCanvasSize);
        }
    });

    // code for handling sign buttons
    const [canvas, setCanvas] = useState();

    const canvasRef = useCallback(node => {
        if (node !== null) {
            node.clear();
            setCanvas(node);
        }
    }, []);

    const handleSave = () => {
        if (!canvas) return;

        if (canvas.isEmpty()) {
            props.onCancel();
        } else {
            props.onSubmit(canvas.toDataURL());
        }
    }

    return (
        <View style={styles_.container}>
            <View style={styles.sketchContainer} ref={canvasContainerRef}>
                {canvasHeight &&
                    <SignatureCanvas redrawOnResize height={canvasHeight} ref={canvasRef} />
                }
            </View>
            <View style={styles.buttonsContainer}>
                <Button
                    title="Submit signature"
                    style={styles.button}
                    onPress={handleSave}
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