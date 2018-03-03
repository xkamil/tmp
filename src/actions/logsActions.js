export const UPDATE_LOGS = "UPDATE_LOGS";

export const updateLogs = (logs, error) => ({
    type: UPDATE_LOGS,
    logs,
    error
});

export const fetchLogs = () => {
    return (dispatch, getState, api) => {
        return api.getLogs().then(
            logs => dispatch(updateLogs(logs)),
            error => dispatch(updateLogs(null, error))
        );
    }
};

export const clearLogs = () => {
    return (dispatch, getState, api) => {
        return api.clearLogs().then(
            () => dispatch(updateLogs([])),
            error => dispatch(updateLogs(null, error))
        );
    }
};

