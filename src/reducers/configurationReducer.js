import {UPDATE_CONFIGURATION} from "../actions/configurationActions";

const initialState = {configuration: {}, apiError: null};

const configurationReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_CONFIGURATION :
            return {...state, configuration: action.configuration, error: action.error};
        default:
            return state;
    }
};

export default configurationReducer;