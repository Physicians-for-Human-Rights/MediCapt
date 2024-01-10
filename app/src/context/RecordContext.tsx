import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  Dispatch,
} from 'react'
import _ from 'lodash'
import { RecordMetadata } from 'utils/types/recordMetadata'

export interface RecordState {
  records: RecordMetadata[]
  hasMore: boolean
  itemsPerPage?: number
  filterLocationID: string
  filterSealed: string
  filterSearchType: string
  filterText: string | undefined
  // doSearch: () => any
  // selectItem: (f: FormMetadata) => any
}

const initialState: RecordState = {
  records: [],
  hasMore: false,
  filterSealed: '',
  filterLocationID: '',
  filterText: '',
  filterSearchType: '',
  itemsPerPage: 0,
}

export type RecordAction =
  | { type: 'SET_FILTER_LOCATION_ID'; payload: string }
  | { type: 'SET_FILTER_SEALED'; payload: string }
  | { type: 'SET_FILTER_SEARCH_TYPE'; payload: string }

function recordReducer(
  state: RecordState = initialState,
  action: RecordAction
): RecordState {
  switch (action.type) {
    case 'SET_FILTER_LOCATION_ID':
      return { ...state, filterLocationID: action.payload }
    case 'SET_FILTER_SEALED':
      return { ...state, filterSealed: action.payload }
    case 'SET_FILTER_SEARCH_TYPE':
      return { ...state, filterSearchType: action.payload }
    default:
      return state
  }
  return state
}
const RecordContext = createContext<RecordState>(null as any)
const RecordDispatchContext = createContext<Dispatch<any>>(null as any)

export function RecordContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(recordReducer, initialState)
  return (
    <RecordContext.Provider value={state}>
      <RecordDispatchContext.Provider value={dispatch}>
        {children}
      </RecordDispatchContext.Provider>
    </RecordContext.Provider>
  )
}

export const useRecord = () => useContext(RecordContext)
export const useRecordDispatch = () => useContext(RecordDispatchContext)
