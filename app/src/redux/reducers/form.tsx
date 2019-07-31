import { FORM_SET_PATH, FORM_SET_ID } from "../actionTypes";

const initialState = {
    formId: {},
    formPaths: {}
};

export default function(state = initialState, action) {
    switch (action.type) {
        case FORM_SET_PATH: {
            const { path, value } = action.payload;
            return {
                ...state,
                formPaths: {
                    ...state.formPaths,
                    [path]: {
                        value: value
                    }
                }
            };
        }
        case FORM_SET_ID: {
            return {
                ...state,
                formId: action.payload.id
            };
        }
        default:
            return state;
    }
}
