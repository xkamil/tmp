import {UPDATE_LOGS} from "../actions/logsActions";

const initialState = {logs: [], apiError: null};

const logsReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_LOGS:
            return {...state, logs: action.logs, apiError: action.error};
        default:
            return state;
    }
};

export default logsReducer;