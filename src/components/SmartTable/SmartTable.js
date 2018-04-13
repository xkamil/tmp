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
            filters: {},
            order: -1,
            orderBy: 'time'
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!areEqualDeep(this.props.data, nextProps.data)) {
            this.updateState(nextProps.data);
        }
    }

    updateState(data) {
        this.setState({data})
    }

    applyFilters(data) {
        const filterNames = Object.getOwnPropertyNames(this.state.filters);

        return data.filter(record => {
            for (let i = 0; i < filterNames.length; i++) {
                if (record[filterNames[i]] && JSON.stringify(record[filterNames[i]]).indexOf(this.state.filters[filterNames[i]]) === -1) {
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
        const {headers} = this.props;
        const data = sortBy(this.applyFilters(this.props.data || []), this.state.orderBy, this.state.order);

        return (
            <table className="table">
                <thead className="thead-dark">
                <TableHeader headers={headers} changeOrder={this.handleChangeOrder}/>
                </thead>
                <tbody>
                {data.length > 0 &&
                <tr>{headers.map((header, idx) =>
                    <td key={idx}>
                        <FilterInput handleFilterChange={this.handleFilerChange}
                                     id={header}
                                     value={this.state.filters[header]}/>
                    </td>)}
                </tr>}
                {data.map((record, idx) => <TableRow key={idx} items={headers.map(header => record[header])}/>)}

                {data.length === 0 &&
                <tr>
                    <td colSpan={headers.length} style={{textAlign: 'center'}}><h1>No data</h1></td>
                </tr>
                }

                </tbody>
            </table>
        );
    }
}

SmartTable.propTypes = {
    data: PropTypes.array,
    headers: PropTypes.array.isRequired
};

export default SmartTable;