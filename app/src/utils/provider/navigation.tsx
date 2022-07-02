import { StackScreenProps } from '@react-navigation/stack'
import { FormMetadata } from 'utils/types/formMetadata'
import { RecordMetadata } from 'utils/types/recordMetadata'

export type RootStackParamList = {
  Home: {}
  FindRecord: {
    onlyUserRecords?: boolean
  }
  FindForm: {}
  YourRecords: {}
  RecordEditor:
    | {
        formMetadata: FormMetadata
        displayPageAfterOverview?: boolean
        isAssociatedRecord?: boolean
        addAssociatedRecord?: (r: RecordMetadata) => any
      }
    | {
        recordMetadata: RecordMetadata
      }
  Sharing: {}
  Settings: {}
  Training: {}
}

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>
