import React, {Component} from 'react';
import {
    BrowserRouter as Router,
    Route
} from 'react-router-dom';
import Users from "../containers/users/Users";
import Configuration from "../containers/configuration/Configuration";
import MainMenu from "../components/MainMenu";
import Tokens from "./tokens/Tokens";
import Logs from "./logs/Logs";
import Tools from "./tools/Tools";
import AuthorizationCode from "./authorization_code/AuthorizationCode";
import Index from "./index/Index";

class App extends Component {
    render() {
        return (
            <Router>
                <div className="container">
                    <MainMenu/>
                    <Route exact path="/" component={Index}/>
                    <Route exact path="/index" component={Index}/>
                    <Route exact path="/users" component={Users}/>
                    <Route exact path="/configuration" component={Configuration}/>
                    <Route path="/tokens" component={Tokens}/>
                    <Route exact path="/logs" component={Logs}/>
                    <Route exact path="/authorizationCode" component={AuthorizationCode}/>
                </div>
            </Router>
        );
    }
}

export default App;
