import { FORM_SET_PATH } from "../actionTypes";

const initialState = {
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
        default:
            return state;
    }
}
