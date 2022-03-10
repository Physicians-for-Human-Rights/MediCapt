import { StackScreenProps } from '@react-navigation/stack'

export type RootStackParamList = {
  Home: { signOut: () => any; user: any }
  FormList: {
    signOut: () => any
    user: any
  }
  FormEditor: {
    signOut: () => any
    user: any
  }
}

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>
