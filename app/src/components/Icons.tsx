import { Icon, IconElement } from '@ui-kitten/components'
import { StyleSheet } from 'react-native'
import { colors } from './nativeBaseSpec'

export const StarIcon = (props: any): IconElement => (
  <Icon {...props} name="star" />
)
export const PrinterIcon = (props: any): IconElement => (
  <Icon {...props} name="printer" />
)
export const AlertIcon = (props: any): IconElement => (
  <Icon {...props} name="alert-triangle" />
)
export const PlusIcon = (props: any): IconElement => (
  <Icon {...props} name="add-box" />
)
export const ShareIcon = (props: any): IconElement => (
  <Icon {...props} name="share" />
)
export const SaveIcon = (props: any): IconElement => (
  <Icon {...props} name="save" />
)
export const CloseIcon = (props: any): IconElement => (
  <Icon {...props} name="close" pack="material" />
)
export const ArrowLeftIcon = (props: any): IconElement => (
  <Icon {...props} name="arrow-back" />
)
export const DownloadCloudIcon = (props: any): IconElement => (
  <Icon {...props} name="cloud-download" />
)
export const UploadCloudIcon = (props: any): IconElement => (
  <Icon {...props} name="cloud-upload" />
)
export const CloseCircleIcon = (props: any): IconElement => (
  <Icon {...props} name="close-circle-outline" />
)
export const CheckIcon = (props: any): IconElement => (
  <Icon {...props} name="checkmark-outline" />
)
export const RefreshIcon = (props: any): IconElement => (
  <Icon {...props} name="refresh-outline" />
)
export const DeleteIcon = (props: any): IconElement => (
  <Icon {...props} name="trash" />
)
export const EditIcon = (props: any): IconElement => (
  <Icon {...props} name="edit" />
)
export const LockIcon = (props: any): IconElement => (
  <Icon {...props} name="lock" />
)
export const CameraIcon = (props: any): IconElement => (
  <Icon {...props} name="camera" />
)
export const SearchIcon = (props: any): IconElement => (
  <Icon {...props} name="search" pack="material" />
)
export const SettingsIcon = (props: any): IconElement => (
  <Icon {...props} name="settings" pack="material" />
)
export const TrainingIcon = (props: any): IconElement => (
  <Icon {...props} name="school" pack="material" />
)
export const MenuIcon = (props: any): IconElement => (
  <Icon {...props} name="menu" pack="material" />
)
export const CalenderIcon = (props: any): IconElement => (
  <Icon {...props} name="calendar-today" pack="material" />
)
export const InputSearchIcon = (props: any): IconElement => (
  <Icon
    {...props}
    pack="material"
    size="tiny"
    name="search"
    fill={colors.coolGray[400]}
    style={{ marginVertical: 8, marginLeft: 8 }}
  />
)
