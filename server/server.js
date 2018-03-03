const server = require('express')();
const app = require('express');
const proxy = require('proxy-express');
const bodyParser = require('body-parser');
const path = require('path');
const urlencode = require('urlencode');
const fs = require('fs');
const USERS = require('./data/users.json');
const RESPONSES = require('./responses.json');
const DEFAULT_CONFIGURATION = require('./data/default_config.json');
const PORT = 3000;
const ENV = process.argv[2] || 'test';
const crypto = require('crypto');
const mongoose = require('mongoose');
const corsMid = require('./middlewares').cors;
const Token = require('./models/Token');

mongoose.connect("mongodb://127.0.0.1/my_database");
let configuration = Object.assign({}, DEFAULT_CONFIGURATION);
let access_tokens = [];
let refresh_tokens = [];
let authorization_codes = [];
let logs = [];
let log;

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));
server.use(corsMid);

// ROUTES =========================================================

server.use((req, res, next) => {
    if (req.url.indexOf('/oauth') === 0) {
        log = {
            method: req.method,
            path: req.url,
            request_headers: req.headers,
            request_body: req.body
        };
    }
    next();
});

// OAUTH2 ROUTES --------------------------------------------------

// grant type = password
server.post('/oauth/token', [validateClientIdMid, validateClientSecretMid], (req, res, next) => {
    if (req.body.grant_type !== 'password') return next('route');

    validateUserCredentials(req.body.username, req.body.password)
        .then(() => generateSuccessfulPasswordGrantResponse(req.body))
        .catch(err => err)
        .then(response => {
            recordResponse(response);
            res.status(response.code).json(response.body)
        });
});

// grant type = refresh_token
server.post('/oauth/token', [validateClientIdMid, validateClientSecretMid], (req, res, next) => {
    if (req.body.grant_type !== 'refresh_token') return next('route');

   validateRefreshToken(req.body.refresh_token)
        .then(generateSuccessfulRefreshTokenGrantResponse)
        .catch(err => err)
        .then(response => {
            recordResponse(response);
            res.status(response.code).json(response.body)
        });
});

// grant type = authorization_code
server.post('/oauth/token', [validateClientIdMid],(req, res, next) => {
    if (req.body.grant_type !== 'authorization_code') return next('route');

    validateAuthorizationCode(req.body.code, req.body.redirect_uri, req.body.code_verifier)
        .then(generateSuccessfulAuthorizationCodeGrantResponse)
        .catch(err => err)
        .then(response => {
            recordResponse(response);
            res.status(response.code).json(response.body)
        });
});

// unknown grant type
server.post('/oauth/token', (req, res, next) => {
    let response = req.body.grant_type ? RESPONSES.INVALID_GRANT : RESPONSES.MISSING_PARAM_GRANT_TYPE;
    res.status(response.code).json(response.body)
});

server.get('/oauth/tokeninfo', (req, res) => {
    validateAuthorizationHeader(req.headers).then((accessTokenInfo) => {
        let response = generateTokenInfoResponse(accessTokenInfo);
        recordResponse(response);
        res.status(response.code).json(response.body);
    }).catch(response => {
        recordResponse(response);
        addHeadersToResponse(res, response.headers);
        res.status(response.code).json(response.body);
    });
});

server.get('/oauth/userinfo', (req, res) => {
    validateAuthorizationHeader(req.headers).then(accessTokenInfo => {
        return generateUserInfoResponse(accessTokenInfo);
    }).then(response => {
        recordResponse(response);
        res.status(response.code).json(response.body);
    }).catch(response => {
        recordResponse(response);
        addHeadersToResponse(res, response.headers);
        res.status(response.code).json(response.body);
    });
});

// OPENID ROUTES

let attributes = {};

server.get('/openid/redirect_callback_example', function (req, res, next) {
    res.json(req.query)
});

server.get('/openid/login_page', function (req, res) {
    let redirectUri = generateAuthorizationCodeRedirectUri(req);

    res.set('Connection', 'close');
    res.redirect(redirectUri);
});

server.get('/openid/generate_code/:userId', function (req, res) {
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
        expires_at: timestamp + configuration.authorization_code_expiration_time,
        expires_in: configuration.authorization_code_expiration_time,
    };

    authorization_codes.push(obj);

    let url = attributes.redirect_uri + '?code=' + obj.code + (obj.state === '' ? '' : '&state=' + obj.state);
    res.redirect(url);
});

server.use(app.static('./server/public'));
server.use(app.static('build'));


//Middlewares

function validateClientIdMid(req, res, next) {
    const clientId = req.body.client_id;

    if (!clientId) {
        res.status(400).json(RESPONSES.MISSING_PARAM_CLIENT_ID.body)
    }else if(clientId !== configuration.client_id){
        res.status(400).json(RESPONSES.INVALID_CLIENT_ID.body)
    }else{
        next();
    }
}

function validateClientSecretMid(req, res, next) {
    const clientSecret = req.body.client_secret;

    if (!clientSecret) {
        res.status(401).json(RESPONSES.MISSING_PARAM_CLIENT_SECRET.body)
    }else if(clientSecret !== configuration.client_secret){
        res.status(401).json(RESPONSES.INVALID_CLIENT_SECRET.body)
    }else{
        next();
    }
}


// HELPER ROUTES --------------------------------------------------

server.get('/helper/clear', (req, res) => {
    access_tokens = [];
    refresh_tokens = [];
    authorization_codes = [];
    attributes = {};
    res.send('All tokens are removed');
});

server.get('/helper/clearRequestsLogs', (req, res) => {
    logs = [];
    res.send('Request logs cleared');
});

server.get('/helper/users', (req, res) => {
    res.json(USERS);
});

server.get('/helper/refresh_tokens', (req, res) => {
    const timestamp = Math.floor(Date.now() / 1000);
    let tokens = JSON.parse(JSON.stringify(refresh_tokens));

    tokens = tokens.map(token => {
        const expires = token.expires_at - timestamp;
        token.expires_in = expires && expires > 0 ? expires : 0;
        return token;
    });

    res.json(tokens);
});

server.get('/helper/access_tokens', (req, res) => {
    const timestamp = Math.floor(Date.now() / 1000);
    let tokens = JSON.parse(JSON.stringify(access_tokens));

    tokens = tokens.map(token => {
        const expires = token.expires_at - timestamp;
        token.expires_in = expires && expires > 0 ? expires : 0;
        return token;
    });

    res.json(tokens);
});

server.get('/helper/configuration', (req, res) => {
    res.json(configuration);
});

server.post('/helper/configuration', (req, res) => {
    configuration = Object.assign(configuration, req.body);
    res.json(configuration);
});

server.get('/helper/resetConfiguration', (req, res) => {
    configuration = Object.assign({}, DEFAULT_CONFIGURATION);
    res.json(configuration);
});

server.get('/helper/logs', (req, res) => {
    res.json(logs);
});

server.get('/helper/expire_all_access_tokens', (req, res) => {
    expireTokens(access_tokens);
    res.json(access_tokens);
});

server.get('/helper/expire_all_refresh_tokens', (req, res) => {
    expireTokens(refresh_tokens);
    res.json(refresh_tokens);
});

server.get('/helper/expire_all_tokens', (req, res) => {
    expireTokens(access_tokens);
    expireTokens(refresh_tokens);
    res.json({
        access_tokens: access_tokens,
        refresh_tokens: refresh_tokens
    })
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

    if (req.query.client_id !== configuration.client_id) {
        queryString = mapObjectToQueryString(invalidClientId.query);
    } else if (configuration.redirect_uris.indexOf(req.query.redirect_uri) === -1) {
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
    let accessToken = generateToken();
    let refreshToken = generateToken();
    let response = Object.assign({}, RESPONSES.SUCCESSFUL_PASSWORD_GRANT);
    let timestamp = Math.floor(Date.now() / 1000);
    let date = new Date();

    authorization_codes = authorization_codes.filter(code => code !== codeInfo);

    response.body.access_token = accessToken;
    response.body.refresh_token = refreshToken;
    response.body.expires_in = configuration.access_token_expiration_time;

    access_tokens.push({
        grant_type: 'authorization_code',
        token: accessToken,
        expires_at: timestamp + configuration.access_token_expiration_time,
        expires_in: configuration.access_token_expiration_time,
        user_id: codeInfo.user_id.toLowerCase(),
        scope: codeInfo.scope,
        created_at: date
    });

    refresh_tokens.push({
        grant_type: 'authorization_code',
        token: refreshToken,
        expires_at: timestamp + configuration.refresh_token_expiration_time,
        expires_in: configuration.refresh_token_expiration_time,
        user_id: codeInfo.user_id.toLowerCase(),
        scope: codeInfo.scope,
        created_at: date
    });

    return response;
}

function generateToken(length) {
    let text = "";
    let tokenLength = length || 416;
    let possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/~";

    for (let i = 0; i < tokenLength; i++)
        text += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

    return '/w' + text;
}

function generateSuccessfulPasswordGrantResponse(reqBody) {
    let accessToken = generateToken();
    let refreshToken = generateToken();
    let response = Object.assign({}, RESPONSES.SUCCESSFUL_PASSWORD_GRANT);
    let timestamp = Math.floor(Date.now() / 1000);
    let date = new Date();

    response.body.access_token = accessToken;
    response.body.refresh_token = refreshToken;
    response.body.expires_in = configuration.access_token_expiration_time;

    access_tokens.push({
        grant_type: 'password',
        token: accessToken,
        expires_at: timestamp + configuration.access_token_expiration_time,
        expires_in: configuration.access_token_expiration_time,
        user_id: reqBody.username.toLowerCase(),
        scope: reqBody.scope || [],
        created_at: date
    });

    refresh_tokens.push({
        grant_type: 'password',
        token: refreshToken,
        expires_at: timestamp + configuration.refresh_token_expiration_time,
        expires_in: configuration.refresh_token_expiration_time,
        user_id: reqBody.username.toLowerCase(),
        scope: reqBody.scope || [],
        created_at: date
    });

    return response;
}

function generateSuccessfulRefreshTokenGrantResponse(tokenInfo) {
    let accessToken = generateToken();
    let response = Object.assign({}, RESPONSES.SUCCESSFUL_REFRESH_TOKEN_GRANT);
    let timestamp = Math.floor(Date.now() / 1000);
    let date = new Date();

    response.body.access_token = accessToken;
    response.body.expires_in = configuration.access_token_expiration_time;

    access_tokens.push({
        grant_type: 'refresh_token',
        token: accessToken,
        expires_at: timestamp + configuration.access_token_expiration_time,
        expires_in: configuration.access_token_expiration_time,
        user_id: tokenInfo.user_id,
        scope: tokenInfo.scope || [],
        created_at: date
    });

    return response;
}

function generateTokenInfoResponse(accessTokenInfo) {
    let timestamp = Math.floor(Date.now() / 1000);
    let response = Object.assign({}, RESPONSES.TOKEN_INFO);

    response.body.scope = accessTokenInfo.scope.split(' ');
    response.body.user_id = accessTokenInfo.user_id;
    response.body.expires_in = accessTokenInfo.expires_at - timestamp;

    return response
}

function generateUserInfoResponse(accessTokenInfo) {
    return new Promise(function (resolve, reject) {
        let user = USERS[accessTokenInfo.user_id];
        let scopes = accessTokenInfo.scope ? accessTokenInfo.scope.split(' ') : [];
        let responseBody = {};
        let response = Object.assign({}, RESPONSES.USER_INFO);

        Object.assign(responseBody, user.scopes.none);
        scopes.forEach(scope => Object.assign(responseBody, user.scopes[scope]));
        response.body = responseBody;

        return resolve(response);
    })
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

function validateUserCredentials(username, password) {
    if (!username) {
        return Promise.reject(RESPONSES.MISSING_PARAM_USERNAME)
    } else if (!password) {
        return Promise.reject(RESPONSES.MISSING_PARAM_PASSWORD)
    } else if (!USERS[username.toLowerCase()] || USERS[username.toLowerCase()].password !== password) {
        return Promise.reject(RESPONSES.INVALID_CREDENTIALS)
    } else {
        return Promise.resolve();
    }
}

function validateRefreshToken(refreshToken) {
    let timestamp = Math.floor(Date.now() / 1000);

    if (!refreshToken) {
        return Promise.reject(RESPONSES.AUTHENTICATION_REQUIRED);
    }

    let tokens = refresh_tokens.filter(tokenInfo => tokenInfo.token === refreshToken);
    let refreshTokenInfo = tokens[0];

    if (!refreshTokenInfo) {
        return Promise.reject(RESPONSES.INVALID_REFRESH_TOKEN);
    } else if (refreshTokenInfo.expires_at <= timestamp) {
        return Promise.reject(RESPONSES.EXPIRED_REFRESH_TOKEN);
    }

    return Promise.resolve({type: 'refresh_token', token: refreshTokenInfo});

}

function validateAuthorizationHeader(headers) {
    let timestamp = Math.floor(Date.now() / 1000);
    let regex = /^Bearer .+/;
    let accessTokenHeader = headers['authorization'];

    return new Promise(function (resolve, reject) {
        if (!regex.test(accessTokenHeader || !accessTokenHeader)) {
            return reject(RESPONSES.INVALID_TOKEN_DATA);
        }

        let accessToken = accessTokenHeader.replace("Bearer ", "");
        let tokens = access_tokens.filter(tokenInfo => tokenInfo.token === accessToken);
        let accessTokenInfo = tokens[0];

        if (!accessTokenInfo) {
            return reject(RESPONSES.INVALID_TOKEN_DATA);
        } else if (accessTokenInfo.expires_at <= timestamp) {
            return reject(RESPONSES.EXPIRED_ACCESS_TOKEN);
        }

        return resolve(accessTokenInfo);
    });
}

function addHeadersToResponse(response, headers) {
    if (headers) {
        headers.forEach(function (header) {
            response.set(header.key, header.value)
        })
    }
}

function recordResponse(response) {
    Object.assign(
        log,
        {
            code: response.code,
            response_headers: response.headers || '',
            response_body: response.body || '',
            created_at: Date.now()
        });

    logs.push(log);
}

function expireTokens(tokensArray) {
    let timestamp = Math.floor(Date.now() / 1000);
    tokensArray.forEach(token => token.expires_at = token.expires_at > timestamp ? timestamp : token.expires_at);
}

function mapObjectToQueryString(obj) {
    let queryString = '';
    let separator;

    Object.getOwnPropertyNames(obj).forEach(param => {
        separator = queryString.length > 0 ? '&' : '?';
        queryString += separator + param + '=' + urlencode(obj[param])
    });

    return queryString;
}

function base64URLEncode(str) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest();
}

function createCodeChallenge(codeChallenge) {
    codeChallenge = codeChallenge ? codeChallenge : '';
    return base64URLEncode(sha256(codeChallenge));
}

if (ENV === 'prod') {
    console.log('Server is running on port: ' + PORT);
    server.listen(PORT);
}
module.exports = server;

