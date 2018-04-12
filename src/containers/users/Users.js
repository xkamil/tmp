import React, {Component} from 'react';
import {fetchUsers} from "../../actions/userActions";
import {connect} from "react-redux";
import SmartTable from "../../components/SmartTable/SmartTable";

class Users extends Component {

    componentDidMount() {
        this.props.fetchUsers();
    }

    render() {
        const users = this.props.users.list;

        return (
            <div>
                <h1>List of users</h1>
                <hr/>
                <SmartTable data={users} headers={['username','password','scopes']}/>
                <hr/>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    users: state.users
});

const mapDispatchToProps = (dispatch) => ({
    fetchUsers: () => dispatch(fetchUsers())
});

Users = connect(mapStateToProps, mapDispatchToProps)(Users);

export default Users;
