import React, {Component} from 'react';
import {Link} from "react-router-dom";

class MainMenu extends Component {
    render() {
        return (
            <nav style={{float: 'right', marginTop: 5}} className="btn-group">
                <Link to="/index" className="btn btn-primary margined">oauth2</Link>
                <Link to="/users" className="btn btn-dark margined">Users</Link>
                <Link to="/configuration" className="btn btn-dark">Configuration</Link>
                <Link to="/tokens/access_tokens" className="btn btn-dark">Tokens</Link>
                <Link to="/logs" className="btn btn-dark">Logs</Link>
                <Link to="/authorizationCode" className="btn btn-dark">Authorization code</Link>
            </nav>
        );
    }
}

export default MainMenu;
