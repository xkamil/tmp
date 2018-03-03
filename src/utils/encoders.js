const crypto = require('crypto');

export const base64URLEncode = (str) => {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};

export const sha256 = (buffer) => {
    return crypto.createHash('sha256').update(buffer).digest();
};

export const createCodeChallenge = (codeChallenge) => {
    return base64URLEncode(sha256(codeChallenge));
};