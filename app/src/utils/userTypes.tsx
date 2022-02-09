import Amplify from 'aws-amplify'
import { Auth } from 'aws-amplify'
import config from './../../config.js'

export enum UserType {
  Provider = 'Provider',
  Associate = 'Associate',
  UserManager = 'UserManager',
  FormDesigner = 'FormDesigner',
  Researcher = 'Researcher',
}

export const UserTypeList = [
  UserType.Provider,
  UserType.Associate,
  UserType.UserManager,
  UserType.FormDesigner,
  UserType.Researcher,
]

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
          disabled: true,
        },
        API: {
          endpoints: [
            {
              name: 'provider',
              endpoint: config.apiGateway.provider.URL,
              region: config.apiGateway.provider.REGION,
              custom_header: async () => {
                return {
                  // @ts-ignore TODO This exists, why doesn't typescript know about it?
                  Authorization: (await Auth.currentSession()).idToken.jwtToken,
                }
              },
            },
          ],
        },
      })
      return
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
          disabled: true,
        },
        API: {
          endpoints: [
            {
              name: 'associate',
              endpoint: config.apiGateway.associate.URL,
              region: config.apiGateway.associate.REGION,
              custom_header: async () => {
                return {
                  // @ts-ignore TODO This exists, why doesn't typescript know about it?
                  Authorization: (await Auth.currentSession()).idToken.jwtToken,
                }
              },
            },
          ],
        },
      })
      return
    case UserType.FormDesigner:
      Amplify.configure({
        Auth: {
          mandatorySignIn: true,
          region: config.cognito.formdesigner.REGION,
          userPoolId: config.cognito.formdesigner.USER_POOL_ID,
          identityPoolId: config.cognito.formdesigner.IDENTITY_POOL_ID,
          userPoolWebClientId: config.cognito.formdesigner.APP_CLIENT_ID,
        },
        Analytics: {
          disabled: true,
        },
        // TODO This API doesn't exist yet
        // API: {
        //   endpoints: [
        //     {
        //       name: 'formdesigner',
        //       endpoint: config.apiGateway.formdesigner.URL,
        //       region: config.apiGateway.formdesigner.REGION,
        //       custom_header: async () => {
        //         return {
        //           // @ts-ignore TODO This exists, why doesn't typescript know about it?
        //           Authorization: (await Auth.currentSession()).idToken.jwtToken,
        //         }
        //       },
        //     },
        //   ],
        // }
      })
      return
    case UserType.Researcher:
      Amplify.configure({
        Auth: {
          mandatorySignIn: true,
          region: config.cognito.researcher.REGION,
          userPoolId: config.cognito.researcher.USER_POOL_ID,
          identityPoolId: config.cognito.researcher.IDENTITY_POOL_ID,
          userPoolWebClientId: config.cognito.researcher.APP_CLIENT_ID,
        },
        Analytics: {
          disabled: true,
        },
        // TODO This API doesn't exist yet
        // API: {
        //   endpoints: [
        //     {
        //       name: 'researcher',
        //       endpoint: config.apiGateway.researcher.URL,
        //       region: config.apiGateway.researcher.REGION,
        //       custom_header: async () => {
        //         return {
        //           // @ts-ignore TODO This exists, why doesn't typescript know about it?
        //           Authorization: (await Auth.currentSession()).idToken.jwtToken,
        //         }
        //       },
        //     },
        //   ],
        // }
      })
      return
    case UserType.UserManager:
      Amplify.configure({
        Auth: {
          mandatorySignIn: true,
          region: config.cognito.usermanager.REGION,
          userPoolId: config.cognito.usermanager.USER_POOL_ID,
          identityPoolId: config.cognito.usermanager.IDENTITY_POOL_ID,
          userPoolWebClientId: config.cognito.usermanager.APP_CLIENT_ID,
        },
        Analytics: {
          disabled: true,
        },
        // TODO This API doesn't exist yet
        // API: {
        //   endpoints: [
        //     {
        //       name: 'usermanager',
        //       endpoint: config.apiGateway.usermanager.URL,
        //       region: config.apiGateway.usermanager.REGION,
        //       custom_header: async () => {
        //         return {
        //           // @ts-ignore TODO This exists, why doesn't typescript know about it?
        //           Authorization: (await Auth.currentSession()).idToken.jwtToken,
        //         }
        //       },
        //     },
        //   ],
        // }
      })
      return
  }
}
