import React, { createContext, useContext, useReducer, useMemo } from 'react'

const initialState = {
  user: null,
  signOut: null,
}

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.user }
    case 'SET_SIGNOUT':
      return { ...state, signOut: action.signOut }
    default:
      return state
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <StoreContext.Provider value={[state, dispatch]}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => useContext(StoreContext)
export const useUser = () => {
  const [state, dispatch] = useContext(StoreContext)
  return [state.user, (user: any) => dispatch({ type: 'SET_USER', user })]
}
export const useSignOut = () => {
  const [state, dispatch] = useContext(StoreContext)
  return [
    state.signOut,
    (signOut: any) => dispatch({ type: 'SET_SIGNOUT', signOut }),
  ]
}
