import React, {Component} from 'react';
import {clearLogs, fetchLogs} from "../../actions/logsActions";
import {connect} from "react-redux";
import SmartTable from "../../components/SmartTable/SmartTable";
import ButtonBar from "../../components/ButtonBar";

const REFRESH_INTERVAL = 1000;

class Logs extends Component {
    interval = null;

    constructor(props){
        super(props);

        this.state = {
            autoRefresh: false
        }
    }

    componentDidMount() {
        this.handleFetchData();
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    handleFetchData = () => {
        this.props.fetch();
    };

    handleClearLogs = () => {
        this.props.clear();
    };

    handleToggleAutoRefresh = (e) => {
        const checked = e.target.checked;

        if (checked) {
            this.interval = setInterval(() => {
                this.handleFetchData();
            }, REFRESH_INTERVAL);

            this.setState({autoRefresh: true})
        }else{
            clearInterval(this.interval);
            this.setState({autoRefresh: false})
        }
    };

    render() {
        const {logs} = this.props.logs || [];

        return (
            <div>
                <h1>Logs</h1>
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
                    <button className="btn btn-primary"
                          disabled={this.state.autoRefresh}
                          onClick={this.handleFetchData}>Refresh</button>
                    <button className="btn btn-danger"
                          onClick={this.handleClearLogs}>Clear</button>
                </ButtonBar>
                <SmartTable data={logs}/>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    logs: state.logs
});

const mapDispatchToProps = (dispatch) => ({
    fetch: () => dispatch(fetchLogs()),
    clear: () => dispatch(clearLogs()),
});

Logs = connect(mapStateToProps, mapDispatchToProps)(Logs);

export default Logs;
