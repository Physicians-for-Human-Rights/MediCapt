import { StackScreenProps } from '@react-navigation/stack'
import { LocationType } from 'utils/types/location'
import { UserType } from 'utils/types/user'

export type RootStackParamList = {
  Home: {}
  EditUser: {
    user?: UserType
    setRefresh?: (d: Date) => any
  }
  FindUser: {
    setRefresh?: (d: Date) => any
  }
  EditLocation: {
    location?: LocationType
    setRefresh?: (d: Date) => any
  }
  FindLocation: {
    onSelect?: (l: LocationType) => any
    setRefresh?: (d: Date) => any
  }
  Settings: {}
  Training: {}
}

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>
