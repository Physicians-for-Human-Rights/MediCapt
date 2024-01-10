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
import { FormMetadata } from 'utils/types/formMetadata'
import { boolean } from 'zod'

const i18n = new I18n()
i18n.store(en)
i18n.defaultLocale = 'en'
i18n.locale = 'en'

function authSignOut() {
  Auth.signOut()
}

export interface FormState {
  forms: FormMetadata[]
  hasMore: boolean
  itemsPerPage?: number
  filterCountry: string
  filterLanguage: string
  filterLocationID: string
  filterSearchType: string
  filterEnabled?: string | undefined
  filterText: string | undefined
  // doSearch: () => any
  // selectItem: (f: FormMetadata) => any
}

const initialState: FormState = {
  forms: [],
  hasMore: false,
  filterCountry: '',
  filterLanguage: '',
  filterLocationID: '',
  filterText: '',
  filterSearchType: '',
  filterEnabled: undefined,
  itemsPerPage: 0,
}

export type StoreAction =
  | { type: 'SET_FILTER_ENABLED'; payload: string | undefined }
  | { type: 'SET_FILTER_COUNTRY'; payload: string }
  | { type: 'SET_FILTER_LANGUAGE'; payload: string }
  | {}

function formReducer(
  state: FormState = initialState,
  action: StoreAction = {}
): FormState {
  if ('type' in action) {
    switch (action.type) {
      case 'SET_FILTER_ENABLED':
        return { ...state, filterEnabled: action.payload }
      case 'SET_FILTER_COUNTRY':
        return { ...state, filterCountry: action.payload }
      case 'SET_FILTER_LANGUAGE':
        return { ...state, filterLanguage: action.payload }
      default:
        return state
    }
  }
  return state
}
const FormContext = createContext<FormState>(null as any)
const FormDispatchContext = createContext<Dispatch<any>>(null as any)

export function FormContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(formReducer, initialState)
  return (
    <FormContext.Provider value={state}>
      <FormDispatchContext.Provider value={dispatch}>
        {children}
      </FormDispatchContext.Provider>
    </FormContext.Provider>
  )
}

export const useFormState = () => useContext(FormContext)
export const useFormDispatch = () => useContext(FormDispatchContext)

// export const useUser = () => {
//   // @ts-ignore Why doesn't typescript like useContext with two return values?
//   const dispatch = useStoreDispatch()
//   const state = useStoreState()
//   return [state.user, (user: any) => dispatch({ type: 'SET_USER', user })]
// }

// export const useSignOut = () => {
//   // @ts-ignore Why doesn't typescript like useContext with two return values?
//   const dispatch = useStoreDispatch()
//   const state = useStoreState()
//   return [
//     state.signOut ? state.signOut : authSignOut,
//     (signOut: any) => dispatch({ type: 'SET_SIGNOUT', signOut }),
//   ]
// }
