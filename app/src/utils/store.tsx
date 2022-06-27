import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from 'react'
import _ from 'lodash'
import { Auth } from 'aws-amplify'
import { splitLocations } from 'utils/types/user'
import useMap from 'react-use/lib/useMap'
import { LocationType } from 'utils/types/location'
import { getLocationCached } from 'api/common'

function authSignOut() {
  Auth.signOut()
}

export type StateType = {
  user: string | null
  signOut: (() => any) | null
}

const initialState: StateType = {
  user: null,
  signOut: authSignOut,
}

export type StoreAction =
  | { type: 'SET_USER'; user: string }
  | { type: 'SET_SIGNOUT'; signOut: () => any }
  | {}

function reducer(
  state: StateType = initialState,
  action: StoreAction = {}
): StateType {
  if ('type' in action) {
    switch (action.type) {
      case 'SET_USER':
        return { ...state, user: action.user }
      case 'SET_SIGNOUT':
        return { ...state, signOut: action.signOut }
      default:
        return state
    }
  }
  return state
}

const StoreContext = createContext(initialState)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    // @ts-ignore TODO Why does think want value to be null?
    <StoreContext.Provider value={[state, dispatch]}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => useContext(StoreContext)
export const useUser = () => {
  // @ts-ignore Why doesn't typescript like useContext with two return values?
  const [state, dispatch] = useContext(StoreContext)
  return [state.user, (user: any) => dispatch({ type: 'SET_USER', user })]
}
export const useSignOut = () => {
  // @ts-ignore Why doesn't typescript like useContext with two return values?
  const [state, dispatch] = useContext(StoreContext)
  return [
    state.signOut ? state.signOut : authSignOut,
    (signOut: any) => dispatch({ type: 'SET_SIGNOUT', signOut }),
  ]
}

// A list of locations this user has access to or null if the user has access to
// all locations. This is used to display relevant locations, not for checking
// permissions.
export const useUserLocationIDs = () => {
  // @ts-ignore Why doesn't typescript like useContext with two return values?
  const [state] = useContext(StoreContext)
  if (
    state &&
    state.user &&
    state.user.attributes &&
    state.user.attributes['custom:allowed_locations']
  ) {
    return splitLocations(state.user.attributes['custom:allowed_locations'])
  }
  return []
}

// This will refresh until it contains an array of LocationTypes or if they
// cannot be resolved, locationIDs (strings). Never use this for checking
// permissions, only for display.
export const useUserLocations = () => {
  const locationIDs = useUserLocationIDs()
  const [locationMap, { set, setAll, remove, reset }] = useMap(
    {} as Record<string, LocationType>
  )

  useEffect(() => {
    _.map(locationIDs, lID =>
      getLocationCached(lID, (id, item) => {
        if (item) set(id, item)
      })
    )
  }, [])

  return _.map(locationIDs, lID =>
    lID in locationMap ? locationMap[lID] : lID
  )
}
