import { StackScreenProps } from '@react-navigation/stack'

export type RootStackParamList = {
  Home: {}
  FormList: {}
  FormEditor: {}
}

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>
