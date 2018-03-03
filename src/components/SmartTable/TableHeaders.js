import PropTypes from 'prop-types';
import React from 'react';

const style = {
    cursor: 'pointer'
};

const TableHeader = (props) => {
    return (
        <tr>
            {props.headers.map((header, idx) =>
                <th key={idx}
                    onClick={() => props.changeOrder(header)}
                    style={style}
                >{format(header)}</th>)
            }
        </tr>
    )
};

TableHeader.propTypes = {
    headers: PropTypes.array.isRequired,
    changeOrder: PropTypes.func.isRequired
};

function format(underscored) {
    underscored = underscored.replace(/_/, ' ');
    return underscored.charAt(0).toUpperCase() + underscored.slice(1);
}

export default TableHeader;