import { StyleSheet } from 'react-native'
import { colors } from './nativeBaseSpec'

export const spacing = StyleSheet.create({
  p2: {
    padding: 2,
  },
  px1: {
    paddingHorizontal: 4,
  },
  px5: {
    paddingHorizontal: 16,
  },
  px6: {
    paddingHorizontal: 24,
  },
  py2: {
    paddingVertical: 8,
  },
  py3: {
    paddingVertical: 12,
  },
  py4: {
    paddingVertical: 16,
  },
  mx3: {
    marginHorizontal: 12,
  },
})

const styles = StyleSheet.create({
  dashboardWrapper: {
    width: 80,
    backgroundColor: 'white',
    borderRightColor: colors.coolGray[200],
    borderRightWidth: 1,
  },
  headerWrapper: {
    borderBottomWidth: 1,
    borderColor: colors.coolGray[200],
  },
  dashbordContainer: {
    display: 'flex',
    flex: 1,
    borderColor: colors.coolGray[200],
  },
  formEditorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  formEditorListBox: {
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
    barckgroundColor: colors.muted[50],
  },
})

export default styles
