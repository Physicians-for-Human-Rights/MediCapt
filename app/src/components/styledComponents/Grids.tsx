import { View, StyleSheet } from 'react-native'
import { ReactNode } from 'react'

const styles = StyleSheet.create({
  container: {
    flex: 4, // the number of columns you want to devide the screen into
    marginHorizontal: 'auto',
    width: 400,
    backgroundColor: 'red',
  },
  row: {
    flexDirection: 'row',
  },
  col2: {
    flex: 2,
  },
})
interface Props {
  children?: ReactNode
  // any props that come into the component
}
// RN Code
export const Row = ({ children }: Props) => (
  <View style={styles.row}>{children}</View>
)
export const Container = ({ children }: Props) => (
  <View style={styles.container}>{children}</View>
)
export const Col2 = ({ children }: Props) => (
  <View style={styles.col2}>{children}</View>
)
