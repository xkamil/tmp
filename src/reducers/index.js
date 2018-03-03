import {combineReducers} from 'redux';
import userReducer from './userReducer';
import configurationReducer from './configurationReducer';
import logsReducer from "./logsReducer";
import tokensReducer from "./tokensReducer";

const reducers = combineReducers({
    users: userReducer,
    configuration: configurationReducer,
    logs: logsReducer,
    tokens: tokensReducer
});

export default reducers;