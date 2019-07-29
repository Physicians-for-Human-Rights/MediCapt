import React from "react";
import {
  Platform,
  StyleSheet,
  Image,
  Text,
  View,
  Modal,
  Picker
} from "react-native";
import { Input, Button, ButtonGroup } from "react-native-elements";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { Auth } from "aws-amplify";
var _ = require("lodash");
var getYear = require("date-fns/get_year");
import { isValid, parse } from "date-fns";
import logo from "../../assets/medicapt.png";

import { connect } from "react-redux";
import { setUser } from "../redux/actions";

import {
  Authenticator,
  SignIn,
  SignUp,
  ConfirmSignIn,
  ConfirmSignUp,
  Greetings,
  VerifyContact,
  ForgotPassword,
  TOTPSetup,
  Loading
} from "aws-amplify-react";

class AuthScreen extends React.Component {
  constructor(props) {
    super(props);
    this.handleAuthStateChange = this.handleAuthStateChange.bind(this);
  }
  handleAuthStateChange(state) {
    if (state === "signedIn") {
      Auth.currentAuthenticatedUser()
        .then(user => {
          this.props.setUser(user);
          this.props.navigation.navigate("App");
        })
        .catch(x => console.log("Not signed in")); // TODO Better error handling, should sign out user.
    }
  }
  render() {
    return (
      <Authenticator
        hideDefault={true}
        onStateChange={this.handleAuthStateChange}
      >
        <SignIn />
        <SignUp
          signUpConfig={{
            signUpFields: [
              {
                label: "Username",
                key: "username",
                required: true,
                placeholder: "Username",
                displayOrder: 1
              },
              {
                label: "Email",
                key: "email",
                required: true,
                placeholder: "Email",
                type: "email",
                displayOrder: 2
              },
              {
                label: "Phone Number",
                key: "phone_number",
                placeholder: "Phone Number",
                required: true,
                displayOrder: 3
              },
              {
                label: "Full name",
                key: "name",
                required: true,
                placeholder: "Your full name",
                displayOrder: 4
              },
              {
                label: "What should we call you?",
                key: "nickname",
                required: true,
                placeholder: "Your name",
                displayOrder: 5
              },
              {
                label: "Gender",
                key: "gender",
                required: true,
                displayOrder: 6
              },
              {
                label: "Birthdate",
                key: "birthdate",
                required: true,
                type: "date",
                displayOrder: 7
              },
              {
                label: "Official ID Type",
                key: "custom:official_id_type",
                required: true,
                displayOrder: 8
              },
              {
                label: "Official ID Number",
                key: "custom:official_id_number",
                required: true,
                displayOrder: 9
              },
              {
                label: "Official ID Expiration",
                key: "custom:official_id_expires",
                required: true,
                type: "date",
                displayOrder: 10
              },
              {
                label: "Password",
                key: "password",
                required: true,
                placeholder: "Password",
                type: "password",
                displayOrder: 11
              }
            ]
          }}
        />
        <ConfirmSignIn />
        <ConfirmSignUp />
        <Greetings />
        <VerifyContact />
        <ForgotPassword />
        <Loading />
      </Authenticator>
    );
  }
}

export default connect(
  null,
  { setUser }
)(AuthScreen);
