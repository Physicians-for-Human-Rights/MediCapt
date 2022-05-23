import Amplify, { Auth } from 'aws-amplify'
import config from '../../config.js'
import { UserType } from 'utils/types/user'

export enum UserKind {
  Provider = 'Provider',
  Associate = 'Associate',
  Manager = 'Manager',
  FormDesigner = 'FormDesigner',
  Researcher = 'Researcher',
}

export const UserKindNames = {
  [UserKind.Provider]: 'Healthcare provider',
  [UserKind.Associate]: 'Associate',
  [UserKind.Manager]: 'Manager',
  [UserKind.FormDesigner]: 'Form designer',
  [UserKind.Researcher]: 'Researcher',
}

export const UserKindList = [
  UserKind.Provider,
  UserKind.Associate,
  UserKind.Manager,
  UserKind.FormDesigner,
  UserKind.Researcher,
]

export const UserPoolId = {
  Provider: config.cognito.provider.USER_POOL_ID,
  Associate: config.cognito.associate.USER_POOL_ID,
  Manager: config.cognito.manager.USER_POOL_ID,
  FormDesigner: config.cognito.formdesigner.USER_POOL_ID,
  Researcher: config.cognito.researcher.USER_POOL_ID,
}

export function reconfigureAmplifyForUserKind(userKind: UserKind) {
  switch (userKind) {
    case UserKind.Provider:
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
    case UserKind.Associate:
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
    case UserKind.FormDesigner:
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
        API: {
          endpoints: [
            {
              name: 'formdesigner',
              endpoint: config.apiGateway.formdesigner.URL,
              region: config.apiGateway.formdesigner.REGION,
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
    case UserKind.Researcher:
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
    case UserKind.Manager:
      Amplify.configure({
        Auth: {
          mandatorySignIn: true,
          region: config.cognito.manager.REGION,
          userPoolId: config.cognito.manager.USER_POOL_ID,
          identityPoolId: config.cognito.manager.IDENTITY_POOL_ID,
          userPoolWebClientId: config.cognito.manager.APP_CLIENT_ID,
        },
        Analytics: {
          disabled: true,
        },
        API: {
          endpoints: [
            {
              name: 'manager',
              endpoint: config.apiGateway.manager.URL,
              region: config.apiGateway.manager.REGION,
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
  }
}

// We do a best effort to get some kind of name for this user
export function userFullName(
  user: Partial<UserType> | undefined | null,
  placeholder: string
) {
  if (!user) {
    return placeholder
  }
  if (user.formal_name) return user.formal_name
  if (user.name) return user.name
  if (user.email) return user.email
  if (user.nickname) return user.nickname
  if (user.userUUID) return user.userUUID
  return placeholder
}
