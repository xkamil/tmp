const {
    handleGrantTypeMid, validateClientIdMid, validateClientSecretMid, validateRefreshTokenMid,
    validateAuthorizationHeaderMid, validateUserCredentialsMid, recordLogsMid, corsMid
} = require("./middlewares");
const {
    mapObjectToQueryString, createCodeChallenge, generateToken, createAccessToken, createRefreshToken, expireTokens
} = require('./utils');
const configuration = require('./configuration');
const server = require('express')();
const app = require('express');
const bodyParser = require('body-parser');
const RESPONSES = require('./responses.json');
const PORT = 3000;
const ENV = process.argv[2] || 'test';
const mongoose = require('mongoose');
const Token = require('./models/Token');
const User = require('./models/User');
const Log = require('./models/Log');

mongoose.connect("mongodb://127.0.0.1/my_database");

let authorization_codes = [];

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));
server.use(corsMid);
server.use(recordLogsMid);
server.use((req, res, next) => {
    req.currentDate = new Date();
    next();
});

// OAUTH2 ROUTES --------------------------------------------------

// grant type = password
server.post('/oauth/token', [handleGrantTypeMid('password'), validateClientIdMid, validateClientSecretMid, validateUserCredentialsMid], (req, res) => {
    let accessToken;

    createAccessToken(req.currentDate, 'password', req.body.username.toLowerCase(), req.body.scope)
        .then(({token})=>accessToken = token)
        .then(()=>createRefreshToken(req.currentDate, 'password', req.body.username.toLowerCase(), req.body.scope))
        .then(({token}) => {
            res.json({
                access_token: accessToken,
                token_type: "bearer",
                expires_in: configuration.get().access_token_expiration_time,
                refresh_token: token
            });
        })
        .catch(err => res.status(500).json({message: err}))
});

// grant type = refresh_token
server.post('/oauth/token', [handleGrantTypeMid('refresh_token'), validateClientIdMid, validateClientSecretMid, validateRefreshTokenMid], (req, res) => {
    createAccessToken(req.currentDate, 'refresh_token', req.tokenInfo.user_id, req.tokenInfo.scope)
        .then(accessToken => ({
            access_token: accessToken.token,
            token_type: "bearer",
            expires_in: configuration.get().access_token_expiration_time
        }))
        .then(body => res.json(body))
        .catch(err => res.status(500).json({message: err}))
});

// grant type = authorization_code
server.post('/oauth/token', [handleGrantTypeMid('authorization_code'), validateClientIdMid], (req, res) => {
    validateAuthorizationCode(req.body.code, req.body.redirect_uri, req.body.code_verifier)
        .then(generateSuccessfulAuthorizationCodeGrantResponse)
        .then(response => res.status(response.code).json(response.body))
        .catch(err => err)
});

server.post('/oauth/token', [validateClientIdMid], (req, res) => {
    res.status(400).json(req.body.grant_type ? RESPONSES.INVALID_GRANT.body : RESPONSES.MISSING_PARAM_GRANT_TYPE.body)
});

server.get('/oauth/tokeninfo', validateAuthorizationHeaderMid, (req, res) => {
    const expires_in = req.currentDate >= req.tokenInfo.expires ? 0 :
        (req.currentDate.getTime() - req.tokenInfo.expires.getTime()) / 1000;

    const response = {
        scope: req.tokenInfo.scope.split(' '),
        user_id: req.tokenInfo.user_id,
        expires_in
    };

    res.status(200).json(response);
});

server.get('/oauth/userinfo', validateAuthorizationHeaderMid, (req, res) => {
    const username = req.tokenInfo.user_id;

    return User.findOne({username})
        .then(user => {
            let info = {};
            Object.keys(user.scopes).forEach(scope => Object.assign(info, user.scopes[scope]));
            return info;
        })
        .then(userinfo => res.status(200).json(userinfo))
        .catch(err => res.status(500).json({message: err}));
});

// OPENID ROUTES

let attributes = {};

server.get('/openid/redirect_callback_example', (req, res) => res.json(req.query));

server.get('/openid/login_page', function (req, res) {
    let redirectUri = generateAuthorizationCodeRedirectUri(req);

    res.set('Connection', 'close');
    res.redirect(redirectUri);
});

server.get('/openid/generate_code/:userId', (req, res) => {
    let userId = req.params.userId;
    let code = generateToken(10);
    let timestamp = Math.floor(Date.now() / 1000);
    let date = new Date();

    let obj = {
        code,
        user_id: userId,
        state: attributes.state || '',
        response_type: attributes.response_type,
        code_challenge: attributes.code_challenge,
        scope: attributes.scope,
        created_at: date,
        expires_at: timestamp + configuration.get().authorization_code_expiration_time,
        expires_in: configuration.get().authorization_code_expiration_time,
    };

    authorization_codes.push(obj);

    let url = attributes.redirect_uri + '?code=' + obj.code + (obj.state === '' ? '' : '&state=' + obj.state);
    res.redirect(url);
});

server.use(app.static('./server/public'));
server.use(app.static('build'));

// HELPER ROUTES --------------------------------------------------

server.get('/helper/clear', (req, res) => {
    Token.remove({})
        .then(() => {
            authorization_codes = [];
            attributes = {};
            res.send('All successfully removed');
        })
        .catch(err => res.status(500).json({message: err}));
});

server.get('/helper/users', (req, res) => {
    User.find({})
        .then(users => res.json(users))
        .catch(err => res.status(500).json({message: err}));
});

server.get('/helper/tokens/:type', (req, res) => {
    const type = req.params.type;

    Token.find({type})
        .then(tokens => res.json(tokens))
        .catch(err => res.status(500).json({message: err}));
});

server.get('/helper/configuration', (req, res) => {
    res.json(configuration.get());
});

server.post('/helper/configuration', (req, res) => {
    res.json(configuration.set(req.body));
});

server.get('/helper/resetConfiguration', (req, res) => {
    res.json(configuration.reset());
});

server.get('/helper/logs', (req, res) => {
    Log.find({})
        .then(logs => res.json(logs))
        .catch(err => res.json({message: err}));
});

server.delete('/helper/logs', (req, res) => {
    Log.remove({})
        .then(() => res.send('OK'))
        .catch(err => res.json({message: err}));
});

server.get('/helper/expire_tokens/:type', (req, res) => {
    const type = req.params.type;
    expireTokens(type)
        .then(tokens => res.json(tokens))
        .catch(err => res.status(500).json({message: err}));
});

function generateAuthorizationCodeRedirectUri(req) {
    let state = req.query.state;
    let invalidClientId = Object.assign({}, RESPONSES.AUTH_CODE_INVALID_CLIENT_ID);
    let invalidRedirectUri = Object.assign({}, RESPONSES.AUTH_CODE_INVALID_REDIRECT_URI);
    let invalidResponseType = Object.assign({}, RESPONSES.AUTH_CODE_INVALID_RESPONSE_TYPE);
    let invalidScopes = Object.assign({}, RESPONSES.AUTH_CODE_INVALID_SCOPES);
    let unsupportedChallengeMethod = Object.assign({}, RESPONSES.AUTH_CODE_UNSUPPORTED_CHALLENGE_METHOD);
    let redirectLocation = '/login_page.html';
    let queryString = '';

    if (req.query.client_id !== configuration.get().client_id) {
        queryString = mapObjectToQueryString(invalidClientId.query);
    } else if (configuration.get().redirect_uris.indexOf(req.query.redirect_uri) === -1) {
        queryString = mapObjectToQueryString(invalidRedirectUri.query);
    } else if (req.query.response_type !== 'code') {
        let obj = state ? {state} : {};
        Object.assign(obj, invalidResponseType.query);
        queryString = mapObjectToQueryString(obj);
        redirectLocation = req.query.redirect_uri;
    } else if (typeof req.query.scope !== 'string' || req.query.scope.indexOf('openid') === -1) {
        let obj = state ? {state} : {};
        Object.assign(obj, invalidScopes.query);
        queryString = mapObjectToQueryString(obj);
        redirectLocation = req.query.redirect_uri;
    } else if (req.query.code_challenge && req.query.code_challenge_method !== 'S256') {
        let obj = state ? {state} : {};
        Object.assign(obj, unsupportedChallengeMethod.query);
        queryString = mapObjectToQueryString(obj);
        redirectLocation = req.query.redirect_uri;
    }

    attributes = {
        client_id: req.query.client_id,
        response_type: req.query.response_type,
        redirect_uri: req.query.redirect_uri,
        scope: req.query.scope,
        state: req.query.state,
        code_challenge: req.query.code_challenge_method === 'S256' ? req.query.code_challenge : null
    };

    return redirectLocation + queryString;
}

function generateSuccessfulAuthorizationCodeGrantResponse(codeInfo) {
    authorization_codes = authorization_codes.filter(code => code !== codeInfo);

    let accessToken;
    createAccessToken(req.currentDate, 'authorization_code', codeInfo.user_id.toLowerCase(), codeInfo.scope)
        .then(({token}) => accessToken = token)
        .then(() => createRefreshToken(req.currentDate, 'authorization_code', codeInfo.user_id.toLowerCase(), codeInfo.scope))
        .then(refreshToken => res.json({
                access_token: accessToken,
                token_type: "bearer",
                expires_in: configuration.get().access_token_expiration_time,
                refresh_token: refreshToken
            })
        )
        .catch(err => res.status(500).json({message: err}));
}

function validateAuthorizationCode(code, redirectUri, codeVerifier) {
    let timestamp = Math.floor(Date.now() / 1000);

    return new Promise((resolve, reject) => {
        if (!code) {
            return reject(RESPONSES.AUTH_CODE_INVALID_OR_EXPIRED_CODE);
        }

        let codes = authorization_codes.filter(codeInfo => codeInfo.code === code);
        let codeInfo = codes[0];

        if (!codeInfo) {
            return reject(RESPONSES.AUTH_CODE_INVALID_OR_EXPIRED_CODE);
        } else if (codeInfo.expires_at <= timestamp) {
            return reject(RESPONSES.AUTH_CODE_INVALID_OR_EXPIRED_CODE);
        } else if (redirectUri !== attributes.redirect_uri) {
            return reject(RESPONSES.AUTH_CODE_REDIRECT_URI_NOT_MATCH)
        } else if (codeInfo.code_challenge && codeInfo.code_challenge !== createCodeChallenge(codeVerifier)) {
            return reject(RESPONSES.AUTH_CODE_INVALID_PKCE);
        }

        return resolve({type: 'authorization_code', token: codeInfo});
    });
}

if (ENV === 'prod') {
    console.log('Server listening on port: ' + PORT);
    server.listen(PORT);
}
module.exports = server;

