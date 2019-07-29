import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");
//Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;
const scale = size => (width / guidelineBaseWidth) * size;
const verticalScale = size => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
    size + (scale(size) - size) * factor;

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    },
    logo: {
        height: 100,
        width: 180,
        marginBottom: 10,
        marginTop: 30,
        resizeMode: "contain"
    },
    form: {
        width: "90%"
    },
    picker: {
        height: 50,
        width: 100,
        marginLeft: 10,
        marginRight: 10
    },
    bigTileButton: {
        width: "100px",
        height: "100px"
    },
    submitButton: {
        height: 1000,
        marginTop: 100,
        paddingTop: 100
    },
    oneRow: {
        justifyContent: "center",
        flexDirection: "row",
        height: 50
    },
    keyboardContainer: {
        alignItems: "center",
        justifyContent: "center"
    },
    sideBySideButtons: {
        flex: 0.8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    simpleButton: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10
    },
    buttonText: {
        textAlign: "center",
        color: "#4C64FF",
        padding: 15,
        width: 200
    },
    largeTileButton: {
        width: "100%",
        height: undefined,
        aspectRatio: 1,
        borderColor: "#d5001c",
        borderRadius: 10,
        borderWidth: 1
    },
    welcomeText: {
        fontSize: scale(22)
    },
    syncText: {
        fontSize: scale(15)
    }
});
