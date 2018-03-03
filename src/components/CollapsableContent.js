import React, {Component} from 'react';

class CollapsableContent extends Component {

    constructor(props) {
        super(props);

        this.state = {visible: false};
        this.setVisible = this.setVisible.bind(this);
    }

    setVisible = (visible) => {
        this.setState({...this.state, visible})
    };

    render() {
        const {visible} = this.state;

        let containerStyle = {
            position: 'absolute',
            right: 0,
            left: 0,
            margin: '0 auto',
            maxWidth: '60%',
            minWidth: '20%',
            backgroundColor: '#eee',
            zIndex: 10,
            padding: 5,
            display: this.state.visible ? 'block' : 'none'
        };

        let itemStyle = {color: '#999', cursor: 'pointer'};

        return (
            <div onClick={()=>this.setVisible(!visible)} onMouseLeave={()=>this.setVisible(false)}>
                <small style={itemStyle}>click to expand...</small>
                <div style={containerStyle}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default CollapsableContent;
