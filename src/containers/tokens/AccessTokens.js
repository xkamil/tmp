import React, {Component} from 'react';
import SmartTable from "../../components/SmartTable/SmartTable";
import {connect} from "react-redux";

class AccessTokens extends Component {

    render() {
        return (
            <div>
                <SmartTable data={this.props.access_tokens || []}/>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    access_tokens: state.tokens.access_tokens
});

AccessTokens = connect(mapStateToProps)(AccessTokens);

export default AccessTokens;
