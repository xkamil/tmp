import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {areEqualDeep} from "../../utils/comparators";

class EditableItemsList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            items: []
        }
    }

    componentDidMount() {
        this.setState({items: this.props.items})
    }

    componentWillReceiveProps(nextProps) {
        if (!areEqualDeep(nextProps.items, this.props)) {
            this.setState({items: nextProps.items})
        }
    }

    handleAddItem = (e) => {
        const itemsId = this.props.listId;
        const items = this.state.items.slice();
        items.push('');
        this.setState({items}, () => {
            this.props.onItemListChanged(itemsId, this.state.items)
        })
    };

    handleRemoveItem = (id) => {
        const itemsId = this.props.listId;
        let items = this.state.items.slice();
        items.splice(id, 1);
        this.setState({items}, () => {
            this.props.onItemListChanged(itemsId, this.state.items)
        })
    };

    handleItemChange = (e) => {
        const itemsId = this.props.listId;
        const id = e.target.id;
        const value = e.target.value;
        let items = this.state.items.slice();
        items[id] = value;
        this.setState({items}, () => {
            this.props.onItemListChanged(itemsId, this.state.items)
        })
    };

    render() {
        const {items} = this.state;
        const {label} = this.props;

        return (
            <div>
                <strong><label>{label}</label></strong>
                {items.map((item, idx) => {
                    return (
                        <div key={idx} className="form-group" style={{position: 'relative'}}>
                            <input
                                id={idx}
                                type="text"
                                className="form-control"
                                onChange={this.handleItemChange}
                                value={item}/>
                            <span className="btn btn-danger"
                                  onClick={() => {
                                      this.handleRemoveItem(idx)
                                  }}
                                  style={{position: 'absolute', right: 0, top: 0}}
                            >-</span>
                        </div>)
                })}

                <span className="btn btn-success"
                      onClick={this.handleAddItem}
                > + </span><br/><br/>
            </div>
        );
    }
}

EditableItemsList.propTypes = {
    items: PropTypes.array.isRequired,
    label: PropTypes.string.isRequired,
    listId: PropTypes.string.isRequired,
    onItemListChanged: PropTypes.func
};

export default EditableItemsList;
