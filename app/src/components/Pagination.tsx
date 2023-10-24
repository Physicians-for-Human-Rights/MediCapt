import React, { useState, useEffect } from 'react'
import { Pressable, Spinner } from 'native-base'
import { Text, useStyleSheet } from '@ui-kitten/components'
import themedStyles from 'themeStyled'
// @ts-ignore Form some reason expo doesn't pick up this module without the extension
import formatDate from 'utils/date.ts'
import { t } from 'i18n-js'
import _ from 'lodash'
import { UserType } from 'utils/types/user'
import { LocationType } from 'utils/types/location'
import { layout, spacing } from './styles'
import { View, Dimensions } from 'react-native'
import { breakpoints } from './nativeBaseSpec'

const styleS = useStyleSheet(themedStyles)
const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md

export default function paginateComponent(
  Component: JSX.Element,
  props: any,
  loadNext: (
    pageToken: null | string
  ) => Promise<
    | null
    | { error: string }
    | { pageToken: string | null; contents: UserType[] }
  >
) {
  return function PaginatedComponent() {
    const [page, setPage] = useState(0)
    const [lastPageToken, setLastPageToken] = useState(null as null | string)
    const [finished, setFinished] = useState(false)
    const [cache, setCache] = useState([] as any[])
    const onMore = async () => {
      const result = await loadNext(lastPageToken)
      // TODO Deal with errors
      if (result === null) {
        setFinished(true)
        // Roll back the latest page change, it failed
        setPage(Math.max(page - 1, 0))
        return
      }
      if ('error' in result) {
        // TODO Error handling
        console.error(result.error)
        setFinished(true)
        // Roll back the latest page change, it failed
        setPage(Math.max(page - 1, 0))
        return
      }
      if ('pageToken' in result) setLastPageToken(result.pageToken)
      else {
        setLastPageToken(null)
        setFinished(true)
      }
    }
    useEffect(() => {
      onMore()
    }, [])
    return (
      <>
        {cache[page] === undefined ? (
          <Spinner accessibilityLabel="Loading data..." />
        ) : (
          <Component data={cache[page]} {...props} />
        )}
        (
        <View
          style={[
            layout.hStackGap2,
            layout.alignCenter,
            layout.justifyEnd,
            spacing.mt2,
            { display: isWider ? 'flex' : 'none' },
          ]}
        >
          {_.range(0, cache.length).map((n: number) => (
            <Pressable
              height={8}
              width={8}
              borderRadius={4}
              bg="white"
              color="coolGray.500"
              textAlign="center"
              justifyContent="center"
              borderColor={n === page ? 'primary.700' : undefined}
              borderWidth={n === page ? 1 : undefined}
              onPress={() => setPage(n)}
            >
              <Text style={[styleS.colorCoolGray500, styleS.fontSizeSm]}>
                {n + 1}
              </Text>
            </Pressable>
          ))}
          {!finished && (
            <Pressable
              height={8}
              width={8}
              borderRadius={4}
              bg="white"
              color="coolGray.500"
              textAlign="center"
              justifyContent="center"
              borderColor={undefined}
              borderWidth={undefined}
              onPress={() => {
                setPage(page + 1)
                onMore()
              }}
            >
              <Text style={[styleS.colorCoolGray500, styleS.fontSizeSm]}>
                More
              </Text>
            </Pressable>
          )}
        </View>
        )
      </>
    )
  }
}
