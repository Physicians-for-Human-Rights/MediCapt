import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  Dispatch,
} from 'react'
import _ from 'lodash'
import { I18n } from 'i18n-js'
import { Auth } from 'aws-amplify'
import { splitLocations } from 'utils/types/user'
import useMap from 'react-use/lib/useMap'
import { LocationType } from 'utils/types/location'
import { getLocationCached } from 'api/common'
import en from '../localization/en.json'
import { loadTranslations } from '../i18n'
// import i18n from '../i18n'

const i18n = new I18n()
i18n.store(en)
i18n.defaultLocale = 'en'
i18n.locale = 'en'

function authSignOut() {
  Auth.signOut()
}

export type StateType = {
  // user: string | null
  user: any
  language: string
  signOut: (() => any) | null
  i18n: any
}

const initialState: StateType = {
  // temporary disabled
  // user: null,
  user: {
    username: 'testuser',
    userType: 'provider',
  },
  language: 'en',
  signOut: authSignOut,
  i18n: i18n,
}

export type StoreAction =
  | { type: 'SET_USER'; user: string }
  | { type: 'SET_SIGNOUT'; signOut: () => any }
  | { type: 'SET_LANGUAGE'; language: string }
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
      case 'SET_LANGUAGE':
        const response = require(`../localization/${action.language}.json`)
        const i18n = new I18n()
        i18n.defaultLocale = action.language
        i18n.locale = action.language
        i18n.store(response)
        return { ...state, language: action.language, i18n: i18n }
      default:
        return state
    }
  }
  return state
}

const StoreContext = createContext<StateType>(initialState)
const StoreDispatchContext = createContext<Dispatch<any>>(reducer)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    // @ts-ignore TODO Why does think want value to be null?
    <StoreContext.Provider value={state}>
      <StoreDispatchContext.Provider value={dispatch}>
        {children}
      </StoreDispatchContext.Provider>
    </StoreContext.Provider>
  )
}

export const useStoreState = () => useContext(StoreContext)
export const useStoreDispatch = () => useContext(StoreDispatchContext)

export const useUser = () => {
  // @ts-ignore Why doesn't typescript like useContext with two return values?
  const dispatch = useStoreDispatch()
  const state = useStoreState()
  return [state.user, (user: any) => dispatch({ type: 'SET_USER', user })]
}

export const useSignOut = () => {
  // @ts-ignore Why doesn't typescript like useContext with two return values?
  const dispatch = useStoreDispatch()
  const state = useStoreState()
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
  const state = useStoreState()
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
