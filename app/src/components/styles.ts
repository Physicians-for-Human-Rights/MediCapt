import { StyleSheet } from 'react-native'
import { colors, rounded } from './nativeBaseSpec'

export const spacing = StyleSheet.create({
  p2: {
    padding: 2,
  },
  px1: {
    paddingHorizontal: 4,
  },
  px2: {
    paddingHorizontal: 8,
  },
  px4: {
    paddingHorizontal: 16,
  },
  px5: {
    paddingHorizontal: 20,
  },
  px6: {
    paddingHorizontal: 24,
  },
  px10: {
    paddingHorizontal: 10,
  },
  py1: {
    paddingVertical: 4,
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
  py5: {
    paddingVertical: 20,
  },
  pr4: {
    paddingRight: 16,
  },
  pl2: {
    paddingLeft: 8,
  },
  pt4: {
    paddingTop: 16,
  },
  pt5: {
    paddingTop: 20,
  },
  pb2: {
    paddingBottom: 8,
  },
  m1: {
    margin: 4,
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
  mr2: {
    marginRight: 8,
  },
  mb3: {
    marginBottom: 12,
  },
  mb4: {
    marginBottom: 16,
  },
  mb5: {
    marginBottom: 20,
  },
  my2: {
    marginVertical: 8,
  },
  my5: {
    marginVertical: 20,
  },
  mt10: {
    marginTop: 40,
  },
  mt5: {
    marginTop: 20,
  },
  mt3: {
    marginTop: 12,
  },
  mt2: {
    marginTop: 8,
  },
})

export const borders = StyleSheet.create({
  roundedMd: {
    borderRadius: rounded.md,
  },
  borderBW1: {
    borderBottomWidth: 1,
  },
  borderColorCG200: {
    borderColor: colors.coolGray[200],
  },
})
export const layout = StyleSheet.create({
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vStack: {
    display: 'flex',
    flexDirection: 'column',
  },
  vStackGap2: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  vStackGap3: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  vStackGap4: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  hStack: {
    display: 'flex',
    flexDirection: 'row',
  },

  hStackGap1: {
    display: 'flex',
    flexDirection: 'row',
    gap: 4,
  },
  hStackGap2: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
  },
  hStackGap3: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  },
  hStackGap4: {
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
  },
  hStackGap5: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
  },
  hStackGap10: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  hStackCenterGap2: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  spaceBet: {
    justifyContent: 'space-between',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  alignCenter: {
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  flex3: {
    flex: 3,
  },
  width100percent: {
    width: '100%',
  },
  width70percent: {
    width: '70%',
  },
  width60percent: {
    width: '60%',
  },
  width55percent: {
    width: '45%',
  },
  width40percent: {
    width: '40%',
  },
  width45percent: {
    width: '55%',
  },
  width30percent: {
    width: '30%',
  },
  width32percent: {
    width: '32%',
  },
  width20percent: {
    width: '20%',
  },
  width5percent: {
    width: '5%',
  },
})

export const backgrounds = StyleSheet.create({
  bgMuted50: {
    backgroundColor: colors.muted[50],
  },
  primary600: {
    backgroundColor: colors.primary[600],
  },
  white: {
    backgroundColor: 'white',
  },
})
export const shadows = StyleSheet.create({
  3: {
    // boxShadow: 'rgba(0, 0, 0, 0.27) 0px 3px 4.65px;',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 3.84,
    // elevation: 5,
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
  dashboardButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dashboardLayoutBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: colors.coolGray[200],
    paddingBottom: 16,
    marginTop: 40,
  },
  headerBox: {
    flexDirection: 'column',
    width: '100%',
    alignSelf: 'center',
  },
  formButtonContainer: {
    display: 'flex',
  },
  formEditorAssociations: {
    display: 'flex',
    flexDirection: 'row',
    maxWidth: 300,
    width: 300,
    marginVertical: 12,
  },
  formEditorFileView: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    justifyContent: 'flex-start',
    width: 200,
    maxWidth: 200,
    paddingVertical: 16,
  },
  formEditorFileButtonBox: {
    display: 'flex',
    flexDirection: 'row',
    width: 200,
    maxWidth: 200,
    marginVertical: 12,
  },
  formListVStack: {
    display: 'flex',
    flexDirection: 'column',
    borderColor: colors.coolGray[200],
    borderBottomWidth: 1,
    gap: 16,
    backgroundColor: 'white',
  },
  formListVStackMd: {
    paddingHorizontal: 32,
    paddingVertical: 32,
    borderRadius: 32,
    borderWidth: 1,
  },
  formListVStackBase: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  formListHStack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    alignItems: 'center',
    borderColor: colors.coolGray[800],
  },
  locationListVStack: {
    borderColor: colors.coolGray[200],
    borderBottomWidth: 1,
    flexDirection: 'column',
    display: 'flex',
    gap: 16,
  },
  locationListVStackMd: {
    paddingHorizontal: 32,
    paddingVertical: 32,
    borderRadius: 8,
    borderWidth: 1,
  },
  locationListVStackBase: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  recordListStack: {
    paddingTop: 0,
    paddingBottom: 8,
    gap: 8,
    width: '100%',
    justifyContent: 'center',
    backgroundColor: colors.muted[50],
  },
  userListView: {
    borderColor: colors.coolGray[200],
    borderBottomWidth: 1,
    gap: 16,
  },
  formDesignerView: {
    display: 'flex',
    flexDirection: 'column',
    height: '90%',
    borderRadius: 8,
    backgroundColor: 'white',
    borderColor: colors.coolGray[200],
  },
  formEditorDesignerView: {
    display: 'flex',
    flexDirection: 'column',
    height: '95%',
    borderColor: colors.coolGray[200],
  },
})

export default styles
