import { FORM_SET_PATH, FORM_SET_ID, SET_USER } from './actionTypes'

export const formSetPath = (path, value) => ({
  type: FORM_SET_PATH,
  payload: {
    path: path,
    value: value,
  },
})

export const formSetId = id => ({
  type: FORM_SET_ID,
  payload: {
    id: id,
  },
})

export const setUser = content => ({
  type: SET_USER,
  payload: {
    user: content,
  },
})
