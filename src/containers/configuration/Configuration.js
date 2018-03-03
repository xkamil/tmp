import React, {Component} from 'react';
import {connect} from "react-redux";
import {fetchConfiguration, resetConfiguration, saveConfiguration} from "../../actions/configurationActions";
import {areEqual} from "../../utils/comparators";
import ConfigurationForm from "./ConfigurationForm";

class Configuration extends Component {

    constructor(props) {
        super(props);

        this.state = {
            changed: false,
            configuration: {
                access_token_expiration_time: 0,
                refresh_token_expiration_time: 0,
                client_id: '',
                client_secret: ''
            }
        };
    }

    componentDidMount() {
        this.props.fetch();
    }

    componentWillReceiveProps(nextProps) {
        let configuration = nextProps.configuration.configuration;
        if (!areEqual(this.state.configuration, configuration)) {
            this.setState({...this.state, changed: false, configuration})
        } else if (this.state.changed) {
            this.setState({...this.state, changed: false})
        }
    }

    handleChange(id, value, type) {
        value = type === 'number' ? parseInt(value, 10) : value;
        let configuration = {...this.state.configuration, [id]: value};
        let changed = !areEqual(configuration, this.props.configuration.configuration);

        this.setState({...this.state, changed, configuration});
    }

    handleSave() {
        this.props.save(this.state.configuration);
    }

    handleCancel() {
        this.setState({...this.state, changed: false, configuration: {...this.props.configuration.configuration}})
    }

    handleResetToDefault() {
        this.props.reset();
    }

    render() {
        return (
            <div>
                <h1>Configuration</h1>
                <hr/>

                <ConfigurationForm
                    configuration={this.state.configuration}
                    changed={this.state.changed}
                    handleChange={this.handleChange.bind(this)}
                    handleSave={this.handleSave.bind(this)}
                    handleCancel={this.handleCancel.bind(this)}
                    handleResetToDefault={this.handleResetToDefault.bind(this)}
                />
                <hr/>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {configuration: state.configuration}
};

const mapDispatchToProps = (dispatch) => ({
    fetch: () => dispatch(fetchConfiguration()),
    reset: () => dispatch(resetConfiguration()),
    save: (configuration) => dispatch(saveConfiguration(configuration))
});

Configuration = connect(mapStateToProps, mapDispatchToProps)(Configuration);

export default Configuration;
