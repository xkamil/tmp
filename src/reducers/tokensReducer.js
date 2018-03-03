import {UPDATE_ACCESS_TOKENS, UPDATE_REFRESH_TOKENS, UPDATE_ALL_TOKENS} from "../actions/tokensActions";

const initialState = {access_tokens: [], refresh_tokens: [], apiError: null};

const tokensReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_ACCESS_TOKENS:
            return {...state, access_tokens: action.accessTokens, apiError: action.error};
        case UPDATE_REFRESH_TOKENS:
            return {...state, refresh_tokens: action.refreshTokens, apiError: action.error};
        case UPDATE_ALL_TOKENS:
            return {
                ...state,
                refresh_tokens: action.tokens.refreshTokens,
                access_tokens: action.tokens.accessTokens,
                apiError: action.error
            };
        default:
            return state;
    }
};

export default tokensReducer;