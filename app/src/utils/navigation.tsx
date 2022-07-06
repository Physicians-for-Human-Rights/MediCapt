export function goBackMaybeRefreshing(
  route: any,
  navigation: any,
  reloadPrevious?: React.RefObject<boolean>
) {
  if (
    route &&
    'params' in route &&
    route.params &&
    'setRefresh' in route.params &&
    (reloadPrevious === undefined || reloadPrevious.current)
  ) {
    route.params.setRefresh(new Date())
  }
  navigation.goBack()
}
