import React, {Component} from 'react';
import SmartTable from "../../components/SmartTable/SmartTable";
import {connect} from "react-redux";

class RefreshTokens extends Component {

    render() {
        return (
            <div>
                <SmartTable data={this.props.refresh_tokens || []}/>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    refresh_tokens: state.tokens.refresh_tokens
});

RefreshTokens = connect(mapStateToProps)(RefreshTokens);

export default RefreshTokens;
