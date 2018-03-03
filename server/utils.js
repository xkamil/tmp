const urlencode = require('urlencode');
const crypto = require('crypto');
const configuration = require('./configuration');
const Token = require('./models/Token');

function generateToken(length) {
    let text = "";
    let tokenLength = length || 30;
    let possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/~";

    for (let i = 0; i < tokenLength; i++)
        text += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

    return '/w' + text;
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

function createAccessToken(currentDate, grantType, userId, scope) {
    const token = {
        type: 'access_token',
        grant_type: grantType,
        token: generateToken(),
        expires: new Date(currentDate.getTime() + (configuration.get().access_token_expiration_time * 1000)),
        user_id: userId,
        scope: scope || []
    };

    return new Token(token).save();
}

function createRefreshToken(currentDate, grantType, userId, scope) {
    const token = {
        type: 'refresh_token',
        grant_type: grantType,
        token: generateToken(),
        expires: new Date(currentDate.getTime() + (configuration.get().refresh_token_expiration_time * 1000)),
        user_id: userId,
        scope: scope || []
    };

    return new Token(token).save();
}

function expireTokens(type) {
    const currentDate = new Date();
    const query = type === 'all' ? {} : {type};
    return Token.update(query, {expires: currentDate}, {multi: true});
}

module.exports = {
    createCodeChallenge,
    generateToken,
    mapObjectToQueryString,
    sha256,
    createAccessToken,
    createRefreshToken,
    expireTokens
};


