import { StackScreenProps } from '@react-navigation/stack'
import { LocationType } from 'utils/types/location'
import { UserType } from 'utils/types/user'

export type RootStackParamList = {
  Home: { signOut: () => any; user: any }
  EditUser: {
    signOut: () => any
    user: any
    userToEdit?: UserType
  }
  FindUser: {
    signOut: () => any
    user: any
  }
  EditLocation: {
    signOut: () => any
    user: any
    location?: LocationType
  }
  FindLocation: {
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
