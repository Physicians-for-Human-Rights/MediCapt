import { StackScreenProps } from '@react-navigation/stack'

export type RootStackParamList = {
  Home: {}
  FindRecord: {}
  IncompleteRecords: {}
  FormEditor: {}
  Sharing: {}
  Settings: {}
  Training: {}
}

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>
