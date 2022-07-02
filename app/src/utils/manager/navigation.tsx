import { StackScreenProps } from '@react-navigation/stack'
import { LocationType } from 'utils/types/location'
import { UserType } from 'utils/types/user'

export type RootStackParamList = {
  Home: {}
  EditUser: {
    user?: UserType
  }
  FindUser: {}
  EditLocation: {
    location?: LocationType
  }
  FindLocation: {
    onSelect?: (l: LocationType) => any
  }
  Settings: {}
  Training: {}
}

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>
