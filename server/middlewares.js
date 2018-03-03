const RESPONSES = require('./responses.json');
const configuration = require('./configuration');
const Token = require('./models/Token');
const User = require('./models/User');
const Log = require('./models/Log');

function corsMid(req, res, next) {
    res.set('Access-control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Access-Control-Allow-Headers', req.header('access-control-request-headers'));
    next();
}

function handleGrantTypeMid(grandType) {
    return (req, res, next) => {
        req.body.grant_type === grandType ? next() : next('route');
    }
}

function validateClientIdMid(req, res, next) {
    const clientId = req.body.client_id;

    if (!clientId) {
        res.status(400).json(RESPONSES.MISSING_PARAM_CLIENT_ID.body)
    } else if (clientId !== configuration.get().client_id) {
        res.status(400).json(RESPONSES.INVALID_CLIENT_ID.body)
    } else {
        next();
    }
}

function validateClientSecretMid(req, res, next) {
    const clientSecret = req.body.client_secret;

    if (!clientSecret) {
        res.status(401).json(RESPONSES.MISSING_PARAM_CLIENT_SECRET.body)
    } else if (clientSecret !== configuration.get().client_secret) {
        res.status(401).json(RESPONSES.INVALID_CLIENT_SECRET.body)
    } else {
        next();
    }
}

function validateUserCredentialsMid(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    if (!username) return res.status(400).json(RESPONSES.MISSING_PARAM_USERNAME.body);
    if (!password) return res.status(400).json(RESPONSES.MISSING_PARAM_PASSWORD.body);

    User.findOne({username: username.toLowerCase(), password})
        .then(user => user ? next() : res.status(400).json(RESPONSES.INVALID_CREDENTIALS.body))
        .catch(err => res.status(500).json({message: err}));
}

function validateRefreshTokenMid(req, res, next) {
    const refreshToken = req.body.refresh_token;

    if (!refreshToken) return res.status(401).json(RESPONSES.AUTHENTICATION_REQUIRED.body);

    Token.findOne({type: 'refresh_token', token: refreshToken})
        .then(token => {
            if (!token) {
                res.status(400).json(RESPONSES.INVALID_REFRESH_TOKEN.body);
            } else if (req.currentDate >= token.expires) {
                res.status(400).json(RESPONSES.EXPIRED_REFRESH_TOKEN.body)
            } else {
                req.tokenInfo = token;
                next();
            }
        })
        .catch(err => res.status(500).json(err))
}

function validateAuthorizationHeaderMid(req, res, next) {
    const accessTokenHeader = req.headers['authorization'] || '';
    const accessToken = accessTokenHeader.replace('Bearer ', '');

    if (accessTokenHeader.indexOf("Bearer ") !== 0) {
        return res.status(401).headers(RESPONSES.INVALID_TOKEN_DATA.headers).json(RESPONSES.INVALID_TOKEN_DATA.body);
    }

    Token.findOne({type: 'access_token', token: accessToken})
        .then(token => {
            if (!token) {
                res.status(401).headers(RESPONSES.INVALID_TOKEN_DATA.headers).json(RESPONSES.INVALID_TOKEN_DATA.body);
            } else if (req.currentDate >= token.expires) {
                res.status(401).headers(RESPONSES.EXPIRED_ACCESS_TOKEN.headers).json(RESPONSES.EXPIRED_ACCESS_TOKEN.body);
            } else {
                req.tokenInfo = token;
                next();
            }
        })
        .catch(err => res.status(500).json({message: err}));
}

function recordLogsMid(req, res, next) {
    const path = '/oauth';

    res.headers = function (headers) {
        if (headers) headers.forEach(header => res.set(header.key, header.value));
        return res;
    };

    let resJson = res.json;
    res.json = (json) => {
        res.responseBody = json;
        resJson.call(res, json);
    };

    res.on('finish', () => {
        if (req.url.indexOf(path) === 0) {
            const log = {
                code: res.statusCode,
                method: req.method,
                path: req.url,
                request_headers: req.headers || '',
                request_body: req.body || '',
                response_headers: res._headers || '',
                response_body: res.responseBody || ''
            };

            new Log(log).save();
        }
    });

    next();
}

module.exports = {
    handleGrantTypeMid,
    validateClientIdMid,
    validateClientSecretMid,
    validateRefreshTokenMid,
    validateUserCredentialsMid,
    recordLogsMid,
    corsMid,
    validateAuthorizationHeaderMid
};

