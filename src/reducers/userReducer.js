import {UPDATE_USERS} from "../actions/userActions";

const initialState = {users: [], apiError: null};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_USERS:
            return {...state, list: action.users, apiError: action.error};
        default:
            return state;
    }
};

export default userReducer;