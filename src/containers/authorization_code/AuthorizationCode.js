import React, {Component} from 'react';
import {connect} from "react-redux";
import {fetchConfiguration} from "../../actions/configurationActions";
import {areEqual} from "../../utils/comparators";
import ButtonBar from "../../components/ButtonBar";
import Tools from "../tools/Tools";

class AuthorizationCode extends Component {

    constructor(props) {
        super(props);

        this.state = {
            autoRefresh: false,
            queryString: '',
            configuration: {
                grant_type: 'authorization_code',
                scope: 'openid email profile',
                response_type: 'code',
                code_challenge_method: 'S256',
                code_challenge: 'asfasfsafsfsafsgsadgsgasgasg',
                state: 'fasdfasfs'
            }
        }
    }

    componentDidMount() {
        this.props.fetch();
    }

    handleOpenLoginPage = (e) => {
        const {configuration} = this.state;
        const props = ['grant_type', 'scope', 'response_type', 'code_challenge_method', 'code_challenge', 'client_id', 'state'];
        const redirectUri = document.querySelector('#redirect_uri').value;

        let obj = {};

        if (redirectUri && redirectUri !== '') {
            obj.redirect_uri = redirectUri;
        }

        props.forEach(prop => {
            if (configuration[prop] && configuration[prop] !== '') {
                obj[prop] = configuration[prop];
            }
        });

        let queryString = this.constructQueryString(obj);

        window.open('/openid/login_page' + queryString, '_blank');
    };

    handleChange = (e) => {
        const id = e.target.getAttribute('id');
        const value = e.target.value;
        const configuration = Object.assign(this.state.configuration, {[id]: value});

        this.setState({configuration})
    };

    componentWillReceiveProps(nextProps) {
        const configuration = nextProps.configuration ? nextProps.configuration.configuration : {};

        if (!areEqual(this.state.configuration, configuration)) {
            this.setState({configuration: Object.assign(this.state.configuration, configuration)})
        }
    }

    constructQueryString = (argsObject) => {
        let queryString = '';
        let separator = '?';

        Object.getOwnPropertyNames(argsObject).forEach(arg => {
            queryString += separator + arg + '=' + argsObject[arg];
            separator = '&';
        });

        return queryString;
    };

    handleChallengeChanged = (code_challenge) => {
        this.setState({configuration: {...this.state.configuration, code_challenge}})
    };

    handleVerifierChanged = (code_verifier) => {
        this.setState({configuration: {...this.state.configuration, code_verifier}})
    };

    render() {
        const {configuration} = this.state;

        const createInput = (id, value, label) => (
            <div className="form-group row">
                <label htmlFor={[value]} className="col-3 col-form-label"><strong>{label}</strong></label>
                <div className="col-9">
                    <input className="form-control" type="text" id={id} value={value}
                           onChange={this.handleChange}/>
                </div>
            </div>);

        const createSelect = (id, label, options) => (
            <div className="form-group row">
                <label htmlFor={id} className="col-3 col-form-label"><strong>{label}</strong></label>
                <div className="col-9">
                    <select id={id} className="form-control">
                        {options.map((option, idx) => (
                            <option key={idx} defaultValue={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>);

        return (
            <div>
                <h1>Authorization code</h1>
                <hr/>

                <span><strong>Authorization Url: </strong>{window.location.origin + '/openid/login_page'}</span><br/>

                <hr/>

                <Tools
                    handleVerifierChanged={this.handleVerifierChanged}
                    handleChallengeChanged={this.handleChallengeChanged}/>
                <br/>

                <h3>Generate authorization code</h3>
                <br/>
                {createInput('grant_type', configuration.grant_type, 'Grant type')}
                {createInput('client_id', configuration.client_id, 'Client id')}
                {createInput('scope', configuration.scope, 'Scope')}
                {createInput('response_type', configuration.response_type, 'Response type')}
                {createInput('code_challenge_method', configuration.code_challenge_method, 'Code challenge method')}
                {createInput('state', configuration.state, 'State')}
                {createInput('code_challenge', configuration.code_challenge, 'Code challenge')}
                {createSelect('redirect_uri', 'Redirect uri', (configuration.redirect_uris || []))}

                <ButtonBar>
                    <span className="btn btn-primary" onClick={this.handleOpenLoginPage}>Open login page</span>
                </ButtonBar>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    configuration: state.configuration
});

const mapDispatchToProps = (dispatch) => ({
    fetch: () => dispatch(fetchConfiguration())
});

AuthorizationCode = connect(mapStateToProps, mapDispatchToProps)(AuthorizationCode);

export default AuthorizationCode;
