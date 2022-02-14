import { StackScreenProps } from '@react-navigation/stack'
import { FormMetadata } from 'utils/formTypes'
import { FormsMetadata } from 'utils/formTypesHelpers'

export type RootStackParamList = {
  Home: { signOut: () => any; user: any }
  FindRecord: {
    signOut: () => any
    user: any
  }
  IncompleteRecords: {
    signOut: () => any
    user: any
  }
  FormEditor: {
    signOut: () => any
    user: any
  }
  Sharing: {
    signOut: () => any
    user: any
  }
  Settings: {
    signOut: () => any
    user: any
  }
  Training: {
    signOut: () => any
    user: any
  }
}

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>
