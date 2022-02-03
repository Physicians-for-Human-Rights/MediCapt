import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
// https://www.npmjs.com/package/react-native-dialog
import NativeDialog from "react-native-dialog";

const Dialog = props => {
    const [text, setText] = useState('');

    const handleConfirm = () => {
        props.handleConfirm(text);
        setText('');
    };

    return (
        <View>
            <NativeDialog.Container visible={props.visible}>
                <NativeDialog.Title>{props.title}</NativeDialog.Title>
                <NativeDialog.Description>
                    {props.description}
                </NativeDialog.Description>
                <NativeDialog.Input value={text} onChangeText={value => setText(value)} />
                <NativeDialog.Button label="Cancel" onPress={props.handleCancel} />
                <NativeDialog.Button label="Confirm" onPress={handleConfirm} />
            </NativeDialog.Container>
        </View>
    );
}

const styles = StyleSheet.create({});

export default Dialog;