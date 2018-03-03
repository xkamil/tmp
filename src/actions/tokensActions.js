export const UPDATE_ACCESS_TOKENS = "UPDATE_ACCESS_TOKENS";
export const UPDATE_REFRESH_TOKENS = "UPDATE_REFRESH_TOKENS";
export const UPDATE_ALL_TOKENS = "UPDATE_ALL_TOKENS";

export const updateAccessTokens = (accessTokens, error) => ({
    type: UPDATE_ACCESS_TOKENS,
    accessTokens,
    error
});

export const updateRefreshTokens = (refreshTokens, error) => ({
    type: UPDATE_REFRESH_TOKENS,
    refreshTokens,
    error
});

export const updateAllTokens = (tokens, error) => ({
    type: UPDATE_ALL_TOKENS,
    tokens,
    error
});

export const fetchAccessTokens = () => {
    return (dispatch, getState, api) => {
        return api.getAccessTokens().then(
            tokens => dispatch(updateAccessTokens(tokens)),
            error => dispatch(updateAccessTokens(null, error))
        );
    }
};

export const fetchRefreshTokens = () => {
    return (dispatch, getState, api) => {
        return api.getRefreshTokens().then(
            tokens => dispatch(updateRefreshTokens(tokens)),
            error => dispatch(updateRefreshTokens(null, error))
        );
    }
};

export const expireRefreshTokens = () => {
    return (dispatch, getState, api) => {
        return api.expireRefreshTokens().then(
            tokens => dispatch(updateRefreshTokens(tokens)),
            error => dispatch(updateRefreshTokens(null, error))
        );
    }
};

export const expireAccessTokens = () => {
    return (dispatch, getState, api) => {
        return api.expireAccessTokens().then(
            tokens => dispatch(updateAccessTokens(tokens)),
            error => dispatch(updateAccessTokens(null, error))
        );
    }
};

export const expireAllTokens = () => {
    return (dispatch, getState, api) => {
        return api.expireAllTokens().then(
            tokens => dispatch(updateAllTokens(tokens)),
            error => dispatch(updateAllTokens(null, error))
        );
    }
};

export const removeAllTokens = () => {
    return (dispatch, getState, api) => {
        return api.removeAllTokens().then(
            tokens => dispatch(updateAllTokens({access_tokens: [], refresh_tokens: []})),
            error => dispatch(updateAllTokens(null, error))
        );
    }
};

