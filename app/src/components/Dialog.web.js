import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
// https://mui.com/components/dialogs/
import DialogWeb from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const Dialog = props => {
    const [text, setText] = useState('');

    const handleConfirm = () => {
        props.handleConfirm(text);
        setText('');
    };

    return (
        <View>
            <DialogWeb open={props.visible} onClose={props.handleCancel}>
                <DialogTitle>{props.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {props.description}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        fullWidth
                        variant="standard"
                        value={text}
                        onChange={event => setText(event.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.handleCancel}>Cancel</Button>
                    <Button onClick={handleConfirm}>Confirm</Button>
                </DialogActions>
            </DialogWeb>
        </View>
    );
}

const styles = StyleSheet.create({});

export default Dialog;