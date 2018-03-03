const DEFAULT_CONFIGURATION = {
    access_token_expiration_time: 40,
    refresh_token_expiration_time: 60,
    authorization_code_expiration_time: 60,
    client_id: "TEST_CLIENT_ID",
    client_secret: "TEST_CLIENT_SECRET",
    redirect_uris: [
        "http://eng-killerbees04:3000/openid/redirect_callback_example",
        "http://127.0.0.1:3000/openid/redirect_callback_example",
        "pega://com.pega.hybridclient"
    ]
};

module.exports = {
    _current: Object.assign({}, DEFAULT_CONFIGURATION),

    get: function () {
        return this._current;
    },
    set: function (newConfiguration) {
        return this._current = newConfiguration;
    },
    reset: function () {
        return this._current = DEFAULT_CONFIGURATION;
    }
};

