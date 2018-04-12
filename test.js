let scopes = {
    none: {
        sub: 'd053cc8f0e9d3347dea7d053cc8f0e9d'
    },
    email: {
        email: 'user1@oauth2.com'
    },
    profile: {
        website: 'user1@oauth2.com',
        nickname: 'user1',
        preferred_username: 'user1',
        family_name: 'user1'
    }
};

let dupa = Object.keys(scopes).reduce((previous, current) => {
    previous[current] = scopes[current];
    return previous;
}, {});


console.log(dupa);