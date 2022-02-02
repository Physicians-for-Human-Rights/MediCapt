import Amplify from "aws-amplify";
import { Auth } from "aws-amplify";
import config from "./../config.js";

export enum UserType {
    Provider     = "Provider",
    Associate    = "Associate",
    UserManager  = "UserManager",
    FormDesigner = "FormDesigner",
    Researcher   = "Researcher",
}

export const UserTypeList = [UserType.Provider, UserType.Associate,
                             UserType.UserManager, UserType.FormDesigner,
                             UserType.Researcher]

export function reconfigureAmplifyForUserType(userType: UserType) {
    switch (userType) {
        case UserType.Provider:
            Amplify.configure({
                Auth: {
                    mandatorySignIn: true,
                    region: config.cognito.provider.REGION,
                    userPoolId: config.cognito.provider.USER_POOL_ID,
                    identityPoolId: config.cognito.provider.IDENTITY_POOL_ID,
                    userPoolWebClientId: config.cognito.provider.APP_CLIENT_ID,
                },
                Analytics: {
                    disabled: true
                },
                API: {
                    endpoints: [
                        {
                            name: "provider",
                            endpoint: config.apiGateway.provider.URL,
                            region: config.apiGateway.provider.REGION,
                            custom_header: async () => {
                                return { Authorization: (await Auth.currentSession()).idToken.jwtToken }
                            }
                        }
                    ]
                }
            })
            return;
        case UserType.Associate:
            Amplify.configure({
                Auth: {
                    mandatorySignIn: true,
                    region: config.cognito.associate.REGION,
                    userPoolId: config.cognito.associate.USER_POOL_ID,
                    identityPoolId: config.cognito.associate.IDENTITY_POOL_ID,
                    userPoolWebClientId: config.cognito.associate.APP_CLIENT_ID,
                },
                Analytics: {
                    disabled: true
                },
                API: {
                    endpoints: [
                        {
                            name: "associate",
                            endpoint: config.apiGateway.associate.URL,
                            region: config.apiGateway.associate.REGION,
                            custom_header: async () => {
                                return { Authorization: (await Auth.currentSession()).idToken.jwtToken }
                            }
                        }
                    ]
                }
            })
            return;
    }
}
