import React from "react";
import { Text, View } from "react-native";
import {
    createSwitchNavigator,
    createAppContainer,
    SafeAreaView
} from "react-navigation";
import { createStackNavigator } from 'react-navigation-stack';
import { Header, Icon, Button } from "react-native-elements";

export default class Top extends React.PureComponent {
    render() {
        return (
            <Header
                leftComponent={{
                    icon: "menu",
                    color: "#fff",
                    onPress: this.props.openSideMenu
                }}
                centerComponent={
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <Button
                            title=""
                            icon={<Icon name="arrow-back" size={15} color="white" />}
                            disabled={this.props.currentSection == 0}
                            onPress={() => this.props.sectionOffset(-1)}
                        />
                        <Text
                            style={{
                                width: "60%",
                                marginLeft: "10%",
                                marginRight: "10%",
                                color: "#fff"
                            }}
                            textAlign="center"
                        >
                            Section {this.props.currentSection + 1}
                            {"\n"}
                            {this.props.title ? this.props.title : ""}
                        </Text>
                        <Button
                            title=""
                            disabled={this.props.currentSection == this.props.lastSection}
                            onPress={() => this.props.sectionOffset(1)}
                            icon={<Icon name="arrow-forward" size={15} color="white" />}
                            iconRight
                        />
                    </View>
                }
                rightComponent={
                    // TODO Change this to a submit button
                    { text: "30%", style: { color: "#fff" } }
                }
                containerStyle={{
                    backgroundColor: this.props.isSectionCompleted
                        ? "#1cd500"
                        : "#d5001c",
                    justifyContent: "space-around"
                }}
            />
        );
    }
}
