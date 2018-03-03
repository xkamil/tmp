import React, {Component} from 'react';
import PropTypes from "prop-types";
import {areEqualDeep} from "../../utils/comparators";
import TableRow from "./TableRow";
import TableHeader from "./TableHeaders";
import {sortBy} from "./Utils";
import FilterInput from "./FilterInput";

class SmartTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            headers: [],
            filters: {},
            order: -1,
            orderBy: 'time'
        };
    }

    componentDidMount() {
        this.updateState(this.props.data);
    }

    componentWillReceiveProps(nextProps) {
        if (!areEqualDeep(this.props.data, nextProps.data)) {
            this.updateState(nextProps.data);
        }
    }

    updateState(rawData) {
        let headers = this.extractHeaders(rawData);
        this.setState({headers, rawData})
    }

    extractHeaders(data) {
        let headers = [];
        if (data && data.length > 0) {
            Object.getOwnPropertyNames(data[0]).forEach(header => headers.push(header));
        }
        return headers;
    }

    applyFilters(data) {
        const filterNames = Object.getOwnPropertyNames(this.state.filters);

        return data.filter(record => {
            for (let i = 0; i < filterNames.length; i++) {
                if (JSON.stringify(record[filterNames[i]]).indexOf(this.state.filters[filterNames[i]]) === -1) {
                    return false;
                }
            }
            return true;
        });
    }

    handleFilerChange = (e) => {
        let id = e.target.getAttribute('id');
        let value = e.target.value;

        this.setState({filters: {...this.state.filters, [id]: value}})
    };

    handleChangeOrder = (field) => {
        this.setState({orderBy: field, order: this.state.order * -1});
    };

    render() {
        const {headers} = this.state;
        const data = sortBy(this.applyFilters(this.props.data || []), this.state.orderBy, this.state.order);

        return (
            <table className="table">
                <thead className="thead-dark">
                <TableHeader headers={headers} changeOrder={this.handleChangeOrder}/>
                </thead>
                <tbody>
                <tr>
                    {headers.map((header, idx) => <td key={idx}><FilterInput handleFilterChange={this.handleFilerChange}
                                                                             id={header}
                                                                             value={this.state.filters[header]}/></td>)}
                </tr>
                {data.map((record, idx) => <TableRow key={idx} record={record}/>)}
                </tbody>
            </table>
        );
    }
}

SmartTable.propTypes = {
    data: PropTypes.array,
    skip: PropTypes.array
};

export default SmartTable;