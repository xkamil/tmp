const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const expect = require('chai').expect;
const configuration = require('../configuration');

chai.use(chaiHttp);

const TEST_PORT = 3003;
const URL = '127.0.0.1:' + TEST_PORT;

const DEFAULT_CONFIGURATION = configuration.get();

const GRANT_TYPE_PASSWORD = {
    grant_type: 'password',
    client_id: DEFAULT_CONFIGURATION.client_id,
    client_secret: DEFAULT_CONFIGURATION.client_secret,
    username: 'user1',
    password: 'rules',
    scope: 'profile'
};

const GRANT_TYPE_REFRESH_TOKEN = {
    grant_type: 'refresh_token',
    client_id: DEFAULT_CONFIGURATION.client_id,
    client_secret: DEFAULT_CONFIGURATION.client_secret,
    refresh_token: 'REFRESH_TOKEN'
};



describe("oAuth2 server", function () {

    let app;
    let requestor;

    before(function () {
        app = server.listen(TEST_PORT);
        requestor = chai.request(URL)
    });

    afterEach(function (done) {
        requestor
            .get('/helper/clear')
            .end((err, res) => {
                requestor
                    .get('/helper/clearLogs')
                    .end((err, res) => {
                        requestor
                            .get('/helper/resetConfiguration')
                            .end((err, res) => {
                                done();
                            })
                    })
            })
    });

    describe("POST /oauth/token", function () {

        describe("with grant_type = password", function () {

            it("should return code 200 and access_token, token_type, expires_in, refresh_token", function (done) {
                const data = Object.assign({}, GRANT_TYPE_PASSWORD);

                requestor
                    .post('/oauth/token')
                    .send(data)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.include.all.keys('access_token', 'expires_in', 'refresh_token', 'token_type');
                        expect(res.body.token_type).to.equal('bearer');
                        expect(typeof res.body.expires_in).to.equal('number');
                        expect(typeof res.body.access_token).to.equal('string');
                        expect(typeof res.body.refresh_token).to.equal('string');
                        done();
                    })
            });

            it("should return code 400 with info about invalid credentials for invalid username", function (done) {
                const data = Object.assign({}, GRANT_TYPE_PASSWORD);
                data.username = 'invalid_username';

                const expectedData = {
                    "error": "invalid_grant",
                    "error_description": "invalid_grant: user credentials are not valid"
                };

                requestor
                    .post('/oauth/token')
                    .send(data)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.deep.equal(expectedData);
                        done();
                    })
            });

            it("should return code 400 with info about invalid credentials for invalid password", function (done) {
                const data = Object.assign({}, GRANT_TYPE_PASSWORD);
                data.password = 'invalid_password';

                const expectedData = {
                    "error": "invalid_grant",
                    "error_description": "invalid_grant: user credentials are not valid"
                };

                requestor
                    .post('/oauth/token')
                    .send(data)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.deep.equal(expectedData);
                        done();
                    })
            });

            it("should return code 400 with info about missing username", function (done) {
                const data = Object.assign({}, GRANT_TYPE_PASSWORD);
                delete data.username;

                const expectedData = {
                    "error": "invalid_request",
                    "error_description": "OAuth Client Authentication Failure because username parameter is missing in the request"
                };

                requestor
                    .post('/oauth/token')
                    .send(data)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.deep.equal(expectedData);
                        done();
                    })
            });

        });

        describe("with grant_type = refresh_token", function () {
            let refresh_token;

            beforeEach((function (done) {
                const data = Object.assign({}, GRANT_TYPE_PASSWORD);

                requestor
                    .post('/oauth/token')
                    .send(data)
                    .end((err, res) => {
                        refresh_token = res.body.refresh_token;
                        done();
                    })
            }));

            it("should return code 200 and access_token, token_type, expires_in", function (done) {
                const data = Object.assign({}, GRANT_TYPE_REFRESH_TOKEN);
                data.refresh_token = refresh_token;

                requestor
                    .post('/oauth/token')
                    .send(data)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.include.all.keys('access_token', 'expires_in', 'token_type');
                        expect(res.body.token_type).to.equal('bearer');
                        expect(typeof res.body.expires_in).to.equal('number');
                        expect(typeof res.body.access_token).to.equal('string');
                        done();
                    })
            });

            it("should return code 400 and info about invalid token", function (done) {
                const data = Object.assign({}, GRANT_TYPE_REFRESH_TOKEN);

                const expectedData = {
                    "error": "invalid_request",
                    "error_description": "invalid token"
                };

                requestor
                    .post('/oauth/token')
                    .send(data)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.deep.equal(expectedData);
                        done();
                    })
            });

            it("should return code 400 and info about invalid token", function (done) {
                const data = Object.assign({}, GRANT_TYPE_REFRESH_TOKEN);

                const expectedData = {
                    "error": "invalid_request",
                    "error_description": "invalid token"
                };

                requestor
                    .post('/oauth/token')
                    .send(data)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.deep.equal(expectedData);
                        done();
                    })
            });

            it("should return code 401 with info about authentication required", function (done) {
                const data = Object.assign({}, GRANT_TYPE_REFRESH_TOKEN);
                delete data.refresh_token;

                const expectedData = {
                    "error": "oauth authentication required"
                };

                requestor
                    .post('/oauth/token')
                    .send(data)
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        expect(res.body).to.deep.equal(expectedData);
                        done();
                    })
            });

        });

        it("should return code 400 with info about invalid grant", function (done) {
            const data = Object.assign({}, GRANT_TYPE_PASSWORD);
            data.grant_type = 'invalid_grant_type';

            const expectedData = {
                "error": "invalid_grant",
                "error_description": "invalid_grant: Grant name is not valid as per the Oauth Specification"
            };

            requestor
                .post('/oauth/token')
                .send(data)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal(expectedData);
                    done();
                })
        });

        it("should return code 400 with info about missing grant_type", function (done) {
            const data = Object.assign({}, GRANT_TYPE_PASSWORD);
            delete data.grant_type;

            const expectedData = {
                "error": "invalid_request",
                "error_description": "The param grant_type is missing or not a valid grant_type"
            };

            requestor
                .post('/oauth/token')
                .send(data)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal(expectedData);
                    done();
                })
        });

        it("should return code 400 with info about missing client_id", function (done) {
            const data = Object.assign({}, GRANT_TYPE_PASSWORD);
            delete data.client_id;

            const expectedData = {
                "error": "invalid_request",
                "error_description": "OAuth Client Authentication Failure because client credential is missing"
            };

            requestor
                .post('/oauth/token')
                .send(data)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal(expectedData);
                    done();
                })
        });

        it("should return code 401 with info about missing client_secret", function (done) {
            const data = Object.assign({}, GRANT_TYPE_PASSWORD);
            delete data.client_secret;

            const expectedData = {
                "error": "invalid_client",
                "error_description": "invalid_client: client_secret is must "
            };

            requestor
                .post('/oauth/token')
                .send(data)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.deep.equal(expectedData);
                    done();
                })
        });

        it("should return code 400 with info about invalid client_id", function (done) {
            const data = Object.assign({}, GRANT_TYPE_PASSWORD);
            data.client_id = 'invalid_client_id';

            const expectedData = {
                "error": "invalid_client",
                "error_description": "invalid_client: YOUR_CLIENT_ID  client_id is invalid"
            };

            requestor
                .post('/oauth/token')
                .send(data)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal(expectedData);
                    done();
                })
        });

        it("should return code 401 with info about invalid client_secret", function (done) {
            const data = Object.assign({}, GRANT_TYPE_PASSWORD);
            data.client_secret = 'invalid_client_secret';

            const expectedData = {
                "error": "invalid_client",
                "error_description": "invalid_client: input credentials are not valid"
            };

            requestor
                .post('/oauth/token')
                .send(data)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.deep.equal(expectedData);
                    done();
                })
        });

    });

    describe("GET /oauth/tokeninfo", function () {
        let access_token;

        beforeEach((function (done) {
            requestor
                .post('/oauth/token')
                .send(GRANT_TYPE_PASSWORD)
                .end((err, res) => {
                    access_token = res.body.access_token;
                    done();
                })
        }));

        it("should return code 200 and token info", function (done) {
            requestor
                .get('/oauth/tokeninfo')
                .set('authorization', 'Bearer ' + access_token)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.include.all.keys('scope', 'expires_in', 'user_id');
                    expect(res.body.scope).to.deep.equal(['profile']);
                    expect(typeof res.body.expires_in).to.equal('number');
                    expect(res.body.user_id).to.equal('user1');
                    done();
                })
        });

        it("should return code 401 and error description", function (done) {
            const expectedData = {
                "error": "oauth authentication required"
            };

            requestor
                .get('/oauth/tokeninfo')
                .set('authorization', 'Bearer invalid_access_token')
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.deep.equal(expectedData);
                    expect(res.headers['www-authenticate']).to.equal('error=OAuth bearer token required. Invalid token data');
                    done();
                })
        });

        it("should return code 200 and valid scopes", function (done) {
            let scopesEmailAndProfile = Object.assign({}, GRANT_TYPE_PASSWORD);
            scopesEmailAndProfile.scope = 'email profile';

            requestor
                .post('/oauth/token')
                .send(scopesEmailAndProfile)
                .end((err, res) => {
                    requestor
                        .get('/oauth/tokeninfo')
                        .set('authorization', 'Bearer ' + res.body.access_token)
                        .end((err, res) => {
                            expect(res.body.scope).to.deep.equal(['email', 'profile']);
                            done();
                        })
                });
        });

        it("should return code 200 and decreased expires_in in each request", function (done) {
            let firstRequest;

            requestor
                .get('/oauth/tokeninfo')
                .set('authorization', 'Bearer ' + access_token)
                .end((err, res) => {
                    firstRequest = res.body.expires_in;

                    setTimeout(() => {
                        requestor
                            .get('/oauth/tokeninfo')
                            .set('authorization', 'Bearer ' + access_token)
                            .end((err, res) => {
                                expect(typeof firstRequest).to.equal('number');
                                expect(typeof res.body.expires_in).to.equal('number');
                                expect(firstRequest > res.body.expires_in);

                                done();
                            })
                    }, 1200);
                })
        });

    });

    describe("GET /oauth/userinfo", function () {
        let access_token;

        beforeEach((function (done) {
            const data = Object.assign({}, GRANT_TYPE_PASSWORD);
            data.scope = 'email profile';

            requestor
                .post('/oauth/token')
                .send(data)
                .end((err, res) => {
                    access_token = res.body.access_token;
                    done();
                })
        }));

        it("should return code 200 and user info", function (done) {
            let expectedUserInfo = {
                "sub": "d053cc8f0e9d3347dea7d053cc8f0e9d",
                "website": "user1@oauth2.com",
                "nickname": "user1",
                "preferred_username": "user1",
                "family_name": "user1",
                "email": "user1@oauth2.com"
            };

            requestor
                .get('/oauth/userinfo')
                .set('authorization', 'Bearer ' + access_token)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.deep.equal(expectedUserInfo);
                    done();
                })
        });

        it("should return code 401 and error description", function (done) {
            const expectedData = {
                "error": "oauth authentication required"
            };

            requestor
                .get('/oauth/userinfo')
                .set('authorization', 'Bearer invalid_access_token')
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.deep.equal(expectedData);
                    done();
                })
        });

    });

    describe("helper", () => {

        describe("GET /helper/users", () => {
            const users = require('../data/users.json');

            it("should return list of users", function (done) {
                requestor
                    .get('/helper/users')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.deep.equal(users);
                        done();
                    })
            });
        });

        describe("GET /helper/configuration", () => {

            it("should return code 200 and configuration", function (done) {
                requestor
                    .get('/helper/configuration')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.deep.equal(DEFAULT_CONFIGURATION);
                        done();
                    })
            });
        });

        describe("POST /helper/configuration", () => {

            it("should return code 200 and new configuration", function (done) {
                let defaultConfiguration = Object.assign({}, DEFAULT_CONFIGURATION);
                let newConfiguration = Object.assign(defaultConfiguration,{
                    "access_token_expiration_time": 111,
                    "refresh_token_expiration_time": 222,
                    "client_id": "CLIENT_ID_2",
                    "client_secret": "CLIENT_SECRET_2",
                    "redirect_uri": "http://10.20.34.134:3001/openid/redirect_callback2"
                });

                requestor
                    .post('/helper/configuration')
                    .send(newConfiguration)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.deep.equal(newConfiguration);

                        requestor
                            .get('/helper/configuration')
                            .end((err, res) => {
                                expect(res).to.have.status(200);
                                expect(res.body).to.deep.equal(newConfiguration);
                                done();
                            })
                    })
            });
        });

        describe("GET /helper/expire_tokens/access_token", () => {

            it("should return code 200 and expire access tokens", function (done) {
                let access_token;

                requestor
                    .post('/oauth/token')
                    .send(GRANT_TYPE_PASSWORD)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        access_token = res.body.access_token;

                        requestor
                            .get('/helper/expire_tokens/access_token')
                            .send(GRANT_TYPE_PASSWORD)
                            .end((err, res) => {
                                expect(res).to.have.status(200);

                                setTimeout(()=>{
                                    requestor
                                        .get('/oauth/tokeninfo')
                                        .set('authorization', 'Bearer ' + access_token)
                                        .end((err, res) => {
                                            expect(res).to.have.status(401);
                                            expect(res.headers['www-authenticate']).to.equal('error=OAuth bearer token required. Token has expired');
                                            done();
                                        })
                                },1000);
                            })
                    })
            });
        });

        describe("GET /helper/expire_tokens/refresh_token", () => {

            it("should return code 200 and expire refresh tokens", function (done) {
                let refresh_token;
                let data = Object.assign({}, GRANT_TYPE_REFRESH_TOKEN);

                requestor
                    .post('/oauth/token')
                    .send(GRANT_TYPE_PASSWORD)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        refresh_token = res.body.refresh_token;

                        requestor
                            .get('/helper/expire_tokens/refresh_token')
                            .end((err, res) => {
                                expect(res).to.have.status(200);

                                requestor
                                    .post('/oauth/token')
                                    .send(data)
                                    .end((err, res) => {
                                        expect(res).to.have.status(400);
                                        done();
                                    })
                            })
                    });
            });
        });
    });

});
