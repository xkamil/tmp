import React from 'react';

const style = {
    marginBottom: 10,
    marginTop: 10,
    float: 'right',
    display: 'inline-block'
};

const ButtonBar = (props) => {
    return <div style={style}>
        <div className="btn-group">
            {props.children}
        </div>
    </div>
};

export default ButtonBar;