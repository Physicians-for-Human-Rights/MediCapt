import { StackScreenProps } from '@react-navigation/stack'
import { FormMetadata } from 'utils/types/formMetadata'
import { RecordMetadata } from 'utils/types/recordMetadata'
import { UserType } from 'utils/types/user'

export type RootStackParamList = {
  Home: {}
  FindRecord: {
    onlyUserRecords?: boolean
    setRefresh?: (d: Date) => any
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
        setRefresh?: (d: Date) => any
      }
  Sharing: {}
  Settings: {}
  Training: {}
  FindUser: {
    selectUser: (user: UserType) => any
    defaultLocationUUID: string | undefined
  }
}

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>
