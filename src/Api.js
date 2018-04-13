import axios from 'axios'
import {timestampToDate} from "./utils/formatters";

class Api {
    //TODO static URL = window.location.protocol + '//' + window.location.host;
    static URL = 'http://localhost:3000';

    static getUsers() {
        return Api._get('/helper/users');
    }

    static getConfiguration() {
        return Api._get('/helper/configuration');
    }

    static resetConfiguration() {
        return Api._get('/helper/resetConfiguration');
    }

    static saveConfiguration(configuration) {
        return Api._post('/helper/configuration', configuration);
    }

    static getLogs() {
        return Api._get('/helper/logs').then(logs => {
            return logs.map(log => {
                log.created_at = timestampToDate(log.created_at);
                return log;
            })
        });
    }

    static clearLogs() {
        return Api._delete('/helper/logs');
    }

    static getRefreshTokens() {
        return Api._get('/helper/tokens/refresh_token').then(tokens => {
            return tokens.map(token => {
                token.created_at = timestampToDate(token.created_at);
                return token;
            })
        });
    }

    static getAccessTokens() {
        return Api._get('/helper/tokens/access_token').then(tokens => {
            return tokens.map(token => {
                token.created_at = timestampToDate(token.created_at);
                return token;
            })
        });
    }

    static expireAccessTokens() {
        return Api._get('/helper/expire_tokens/access_token');
    }

    static expireRefreshTokens() {
        return Api._get('/helper/expire_tokens/refresh_token');
    }

    static expireAllTokens() {
        return Api._get('/helper/expire_tokens/all');
    }

    static removeAllTokens() {
        return Api._get('/helper/clear');
    }

    static _get(path) {
        return new Promise((resolve, reject) => {
            axios.get(Api.URL + path).then((response) => {
                resolve(response.data)
            }).catch(reject)
        });
    }

    static _post(path, data) {
        return new Promise((resolve, reject) => {
            axios.post(Api.URL + path, data).then((response) => {
                resolve(response.data)
            }).catch(reject)
        });
    }

    static _delete(path) {
        return new Promise((resolve, reject) => {
            axios.delete(Api.URL + path).then((response) => {
                resolve(response.data)
            }).catch(reject)
        });
    }

}

export default Api;


