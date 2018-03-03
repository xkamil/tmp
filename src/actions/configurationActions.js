export const UPDATE_CONFIGURATION = "UPDATE_CONFIGURATION";

export const updateConfiguration = (configuration, error) => ({
    type: UPDATE_CONFIGURATION,
    configuration,
    error
});

export const fetchConfiguration = () => {
    return (dispatch, getState, api) => {
        return api.getConfiguration().then(
            configuration => dispatch(updateConfiguration(configuration)),
            error => dispatch(updateConfiguration(null, error))
        );
    }
};

export const resetConfiguration = () => {
    return (dispatch, getState, api) => {
        return api.resetConfiguration().then(
            configuration => dispatch(updateConfiguration(configuration)),
            error => dispatch(updateConfiguration(null, error))
        );
    }
};

export const saveConfiguration = (configuration) => {
    return (dispatch, getState, api) => {
        return api.saveConfiguration(configuration).then(
            configuration => dispatch(updateConfiguration(configuration)),
            error => dispatch(updateConfiguration(null, error))
        );
    }
};
