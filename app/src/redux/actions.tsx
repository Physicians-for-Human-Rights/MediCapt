import { FORM_SET_PATH, SET_USER } from "./actionTypes";

export const formSetPath = (path, value) => ({
    type: FORM_SET_PATH,
    payload: {
        path: path,
        value: value
    }
});

export const setUser = content => ({
    type: SET_USER,
    payload: {
        user: content
    }
});
