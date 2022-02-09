import React, { createContext, useContext, useReducer, ReactNode } from 'react'

const initialState: {
  user: string | null
  signOut: (() => any) | null
} = {
  user: null,
  signOut: null,
}

export type StoreAction =
  | { type: 'SET_USER'; user: string }
  | { type: 'SET_SIGNOUT'; signOut: () => any }
  | {}

function reducer(state = initialState, action: StoreAction = {}) {
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
    state.signOut,
    (signOut: any) => dispatch({ type: 'SET_SIGNOUT', signOut }),
  ]
}
