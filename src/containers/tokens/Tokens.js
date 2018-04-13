import React, {Component} from 'react';
import {connect} from "react-redux";
import {
    expireAccessTokens, expireAllTokens, expireRefreshTokens, fetchAccessTokens,
    fetchRefreshTokens, removeAllTokens
} from "../../actions/tokensActions";
import ButtonBar from "../../components/ButtonBar";
import {formatUnderscored} from "../../utils/formatters";
import SmartTable from "../../components/SmartTable/SmartTable";

const REFRESH_INTERVAL = 1000;

class Tokens extends Component {
    interval = null;

    constructor(props) {
        super(props);

        this.state = {
            autoRefresh: true
        }
    }

    componentDidMount() {
        this.handleFetchTokens();
        this.autoRefresh(this.state.autoRefresh);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    handleFetchTokens = () => {
        this.props.fetchAccessTokens();
        this.props.fetchRefreshTokens();
    };

    handleToggleAutoRefresh = (e) => {
        const autoRefresh = e.target.checked;
        this.setState({autoRefresh});
        this.autoRefresh(autoRefresh);
    };

    autoRefresh = (enabled) => {
        if (enabled) {
            this.interval = setInterval(() => {
                this.handleFetchTokens();
            }, REFRESH_INTERVAL);
        } else {
            clearInterval(this.interval);
        }
    };

    render() {
        const path = this.props.location.pathname;
        const name = path.replace(/.*\//, '');
        const {expireAccessTokens, expireRefreshTokens, expireAllTokens, removeAllTokens} = this.props;
        const {access_tokens = [], refresh_tokens = []} = this.props;
        const tokens = [...access_tokens, ...refresh_tokens];

        return (
            <div>
                <h1>{formatUnderscored(name)}</h1>
                <hr/>

                <ButtonBar>

                    <div style={{textAlign: 'center', marginRight: 10}}>
                        <label style={{margin: 9}} htmlFor="auto_refresh">Auto refresh </label>
                        <input
                            id="auto_refresh"
                            type="checkbox"
                            onChange={this.handleToggleAutoRefresh}
                            checked={this.state.autoRefresh}/>
                    </div>

                    <button className="btn btn-primary" disabled={this.state.autoRefresh}
                            onClick={this.handleFetchTokens}>Refresh
                    </button>

                    <button className="btn btn-warning" onClick={expireAccessTokens}>Expire access tokens</button>
                    <button className="btn btn-warning" onClick={expireRefreshTokens}>Expire refresh tokens</button>
                    <button className="btn btn-warning" onClick={expireAllTokens}>Expire all</button>
                    <button className="btn btn-danger" onClick={removeAllTokens}>Remove all</button>

                </ButtonBar>

                <div>
                    <SmartTable data={tokens}
                                headers={['type', 'token', 'user_id', 'scope', 'created_at', 'expires']}/>
                </div>

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
    expireAllTokens: () => dispatch(expireAllTokens()),
});

Tokens = connect(mapStateToProps, mapDispatchToProps)(Tokens);

export default Tokens;
