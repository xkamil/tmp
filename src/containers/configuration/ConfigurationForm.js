import React, {Component} from 'react';
import EditableItemsList from "./EditableItemsList";


class ConfigurationForm extends Component {

    render() {
        const {configuration, changed, handleChange, handleSave, handleCancel, handleResetToDefault} = this.props;

        const createTextInput = (type, id) => (
            <input
                type={type}
                className="form-control"
                value={configuration[id]}
                onChange={(e) => {
                    handleChange(id, e.target.value, type)
                }}/>
        );

        return (
            <form>
                <div className="form-group">
                    <strong><label htmlFor="access_token_expiration_time">Access token expiration time:</label></strong>
                    {createTextInput('number', 'access_token_expiration_time')}
                </div>
                <div className="form-group">
                    <strong><label htmlFor="refresh_token_expiration_time">Refresh token expiration
                        time:</label></strong>
                    {createTextInput('number', 'refresh_token_expiration_time')}
                </div>
                <div className="form-group">
                    <strong><label htmlFor="client_id">Client ID:</label></strong>
                    {createTextInput('text', 'client_id')}
                </div>
                <div className="form-group">
                    <strong><label htmlFor="client_secret">Client secret:</label></strong>
                    {createTextInput('text', 'client_secret')}
                </div>

                <EditableItemsList
                    items={configuration.redirect_uris || []}
                    listId="redirect_uris"
                    onItemListChanged={handleChange}
                    label="Redirect uris:"/>

                <div className="btn-group">
                    {changed && <span className="btn btn-success" onClick={handleSave}>Save</span>}
                    {changed && <span className="btn btn-danger" onClick={handleCancel}>Cancel</span>}
                    <span className="btn btn-primary" onClick={handleResetToDefault}>Reset to default</span>
                </div>
            </form>
        );
    }
}

export default ConfigurationForm;
