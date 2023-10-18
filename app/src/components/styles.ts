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
  ml1: {
    marginLeft: 4,
  },
  ml2: {
    marginLeft: 8,
  },
  mb3: {
    marginBottom: 12,
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
  formEditorFileContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  formEditorVersionBox: {
    backgroundColor: colors.primary[50],
    borderRadius: 8,
  },
  formEditorVersionBoxCenter: {
    borderColor: colors.muted[100],
    backgroundColor: colors.primary[50],
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
  },
  formMenuContainer: {
    borderBottomWidth: 1,
    borderColor: colors.coolGray[200],
    paddingLeft: 16,
    paddingRight: 20,
    paddingVertical: 8,
  },
  signatureNative: {
    height: 210,
    width: 410,
    padding: 0,
  },
  signatureWeb: {
    height: 210,
    width: 410,
    padding: 20,
  },
  userListContainer: {
    width: 200,
    height: 200,
  },
  formEditorFormdesigner: {
    paddingLeft: 40,
    width: 2 / 4,
    maxWidth: 300,
  },
})

export default styles
