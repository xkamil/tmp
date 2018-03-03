import React, {Component} from 'react';
import {createCodeChallenge} from "../../utils/encoders";
import PropTypes from 'prop-types';

class Tools extends Component {

    static propTypes = {
        handleVerifierChanged: PropTypes.func,
        handleChallengeChanged: PropTypes.func
    };

    constructor(props) {
        super(props);

        this.state = {
            codeChallenge: '',
            codeVerifier: ''
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {handleVerifierChanged, handleChallengeChanged} = this.props;

        if (handleVerifierChanged && prevState.codeVerifier !== this.state.codeVerifier) {
            handleVerifierChanged(this.state.codeVerifier)
        }

        if (handleChallengeChanged && prevState.codeChallenge !== this.state.codeChallenge) {
            handleChallengeChanged(this.state.codeChallenge)
        }
    }


    handleChange = (e) => {
        const codeVerifier = e.target.value;
        let codeChallenge = createCodeChallenge(codeVerifier);
        this.setState({codeChallenge, codeVerifier})
    };

    render() {
        return (
            <div>

                <h4>Generate PKCE code challange</h4>

                <div className="form-group">
                    <strong><label >Code verifier</label></strong>
                    <input className="form-control"
                           type="text"
                           value={this.state.codeVerifier}
                           onChange={this.handleChange}/>
                    <span>Length: {this.state.codeVerifier.length}</span>
                </div>
            </div>
        );
    }
}

export default Tools;
