import { StackScreenProps } from '@react-navigation/stack'
import { FormMetadata } from 'utils/types/formMetadata'

export type RootStackParamList = {
  Home: {}
  FormList: {}
  FormEditor: {
    formMetadata?: FormMetadata
  }
}

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>
