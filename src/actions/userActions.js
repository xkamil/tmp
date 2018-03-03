export const UPDATE_USERS = 'FETCH_USERS';


export const updateUsers = (users, error) => (
    {
        type: UPDATE_USERS,
        users,
        error: error
    }
);

export const fetchUsers = () => {
    return (dispatch, getState, api) => {
        return api.getUsers().then(
            users => dispatch(updateUsers(users)),
            error => dispatch(updateUsers(null, error)),
        );
    }
};