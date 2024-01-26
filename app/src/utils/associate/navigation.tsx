import { StackScreenProps } from '@react-navigation/stack'
import { Share } from 'utils/types/share'

export type RootStackParamList = {
  Home: {}
  FindShare: {}
  ShareViewer: {
    share: Share
  }
  Settings: {}
  Training: {}
  YourRecords?: {}
}

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>
