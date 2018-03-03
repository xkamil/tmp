import CollapsableContent from "../CollapsableContent";
import PropTypes from 'prop-types';
import React, {Component} from 'react';

class TableRow extends Component {

    render() {
        const {record} = this.props;
        const propertyNames = Object.getOwnPropertyNames(record);
        const maxWidth = window.innerWidth / propertyNames.length * 1.5;

        return (
            <tr>
                {propertyNames
                    .map((item, idx) => <td style={{maxWidth, overflowWrap: 'break-word'}} key={idx}>{transformData(record[item])}</td>)}
            </tr>
        )
    }
}

TableRow.propTypes = {
    record: PropTypes.object.isRequired
};

function transformData(obj) {
    if (typeof obj === 'object') {
        return <CollapsableContent>
            <pre>{JSON.stringify(obj, null, 2)}</pre>
        </CollapsableContent>;
    } else {
        return obj;
    }
}

export default TableRow;