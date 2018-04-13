import React from 'react';

const style = {
    marginBottom: 10,
    marginTop: 10,
    display: 'flex',
    justifyContent: 'flex-end'
};

const ButtonBar = (props) => {
    return <div style={style}>
        <div className="btn-group" style={{display: 'flex'}}>
            {props.children}
        </div>
    </div>
};

export default ButtonBar;