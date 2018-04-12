import CollapsableContent from "../CollapsableContent";
import PropTypes from 'prop-types';
import React, {Component} from 'react';

class TableRow extends Component {

    render() {
        const {items} = this.props;
        const maxWidth = window.innerWidth / items.length * 1.5;

        return (
            <tr>
                {items.map((item, idx) =>
                    <td
                        style={{maxWidth, overflowWrap: 'break-word'}}
                        key={idx}>{transformData(item)}</td>
                )}
            </tr>
        )
    }
}

TableRow.propTypes = {
    items: PropTypes.array.isRequired
};

function transformData(data) {
    if (typeof data === 'object') {
        return <CollapsableContent>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </CollapsableContent>;
    } else {
        return data;
    }
}

export default TableRow;