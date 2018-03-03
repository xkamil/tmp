import React from 'react';
import PropTypes from "prop-types";

const filterInput = (props) => {
    const {id, handleFilterChange, value} = props;

    return <input type="text"
                  style={{width: '100%', height: 25}}
                  id={id}
                  value={value || ''}
                  onChange={handleFilterChange}/>
};

filterInput.propTypes = {
    id: PropTypes.string.isRequired,
    handleFilterChange: PropTypes.func.isRequired,
    value: PropTypes.any
};

export default filterInput;