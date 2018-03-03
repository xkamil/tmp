import React, {Component} from 'react';
import {connect} from "react-redux";
import {
    expireAccessTokens, expireAllTokens, expireRefreshTokens, fetchAccessTokens,
    fetchRefreshTokens, removeAllTokens
} from "../../actions/tokensActions";
import {Link, Route} from "react-router-dom";
import AccessTokens from "./AccessTokens";
import RefreshTokens from "./RefreshTokens";
import ButtonBar from "../../components/ButtonBar";
import {formatUnderscored} from "../../utils/formatters";

const REFRESH_INTERVAL = 1000;

class Tokens extends Component {
    interval = null;

    constructor(props) {
        super(props);

        this.state = {
            autoRefresh: false
        }
    }

    componentDidMount() {
        this.handleFetchTokens();
    }

    componentWillUnmount(){
        clearInterval(this.interval);
    }

    handleFetchTokens = () => {
        this.props.fetchAccessTokens();
        this.props.fetchRefreshTokens();
    };

    isAccessTokensSection = () => {
        return this.props.location.pathname.indexOf('access_tokens') !== -1;
    };

    isRefreshTokensSection = () => {
        return this.props.location.pathname.indexOf('refresh_tokens') !== -1;
    };

    handleToggleAutoRefresh = (e) => {
        const checked = e.target.checked;

        if (checked) {
            this.interval = setInterval(() => {
                this.handleFetchTokens();
            }, REFRESH_INTERVAL);

            this.setState({autoRefresh: true})
        }else{
            clearInterval(this.interval);
            this.setState({autoRefresh: false})
        }
    };

    render() {
        const path = this.props.location.pathname;
        const name = path.replace(/.*\//, '');
        const {expireAccessTokens, expireRefreshTokens, expireAllTokens, removeAllTokens} = this.props;

        return (
            <div>
                <h1>{formatUnderscored(name)}</h1>
                <hr/>

                <Link to="/tokens/access_tokens" className="btn btn-dark">Access Tokens</Link>
                <Link to="/tokens/refresh_tokens" className="btn btn-dark">Refresh Tokens</Link>

                <ButtonBar>
                    {this.isAccessTokensSection() &&
                    <button className="btn btn-warning" onClick={expireAccessTokens}>Expire access tokens</button>}

                    {this.isRefreshTokensSection() &&
                    <button className="btn btn-warning" onClick={expireRefreshTokens}>Expire refresh tokens</button>}

                    &nbsp;&nbsp;

                    <div style={{textAlign: 'center', marginRight: 10}}>
                        <label style={{margin: 9}} htmlFor="auto_refresh">Auto refresh </label>
                        <input
                            id="auto_refresh"
                            type="checkbox"
                            onChange={this.handleToggleAutoRefresh}
                            checked={this.state.autoRefresh}/>
                    </div>

                    <button className="btn btn-primary" disabled={this.state.autoRefresh} onClick={this.handleFetchTokens}>Refresh</button>
                    <button className="btn btn-warning" onClick={expireAllTokens}>Expire all</button>
                    <button className="btn btn-danger" onClick={removeAllTokens}>Remove all</button>

                </ButtonBar>

                <Route exact path="/tokens/access_tokens" component={AccessTokens}/>
                <Route exact path="/tokens/refresh_tokens" component={RefreshTokens}/>

            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    access_tokens: state.tokens.access_tokens,
    refresh_tokens: state.tokens.refresh_tokens
});

const mapDispatchToProps = (dispatch) => ({
    fetchAccessTokens: () => dispatch(fetchAccessTokens()),
    fetchRefreshTokens: () => dispatch(fetchRefreshTokens()),
    expireAccessTokens: () => dispatch(expireAccessTokens()),
    expireRefreshTokens: () => dispatch(expireRefreshTokens()),
    removeAllTokens: () => dispatch(removeAllTokens()),
    expireAllTokens: () => dispatch(expireAllTokens())
});

Tokens = connect(mapStateToProps, mapDispatchToProps)(Tokens);

export default Tokens;
