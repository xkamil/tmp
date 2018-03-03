import React, {Component} from 'react';

class Index extends Component {

    render() {
        const host = window.location.origin;

        const configuration1 = `container.applicationURL=http://eng-killerbees04.rpega.com:8080/prweb/PRWebLDAP1
container.authentication.type=oauth2
container.authentication.oauth2.grantType=password
container.authentication.oauth2.clientId=bc10ca8d-ac22-4c94-9b6a-d64949864fbf
container.authentication.oauth2.clientSecret=3-UZLSbd3KkowE0NsF78IkhWmico8Uit8wTIh5TcF7UAU2cxYfav7IJwvn5EnU0HpODz70QMdEPoFcu4I-UZYw
container.authentication.oauth2.tokenEndpoint=${host}/oauth/token
container.authentication.oauth2.scope=email profile`;

        const configuration2 = `container.applicationURL=http://eng-killerbees04.rpega.com:8080/prweb/PRWebLDAP1
container.authentication.type=oauth2
container.authentication.oauth2.grantType=authorization_code
container.authentication.oauth2.clientId=bc10ca8d-ac22-4c94-9b6a-d64949864fbf
container.authentication.oauth2.clientSecret=3-UZLSbd3KkowE0NsF78IkhWmico8Uit8wTIh5TcF7UAU2cxYfav7IJwvn5EnU0HpODz70QMdEPoFcu4I-UZYw
container.authentication.oauth2.tokenEndpoint=${host}/oauth/token
container.authentication.oauth2.scope=openid email profile
container.authentication.oauth2.authorizationEndpoint=${host}/openid/login_page
container.authentication.oauth2.redirectUri=pega://com.pega.hybridclient`;

        const configuration3 = `container.applicationURL=http://eng-killerbees04.rpega.com:8080/prweb/PRWebLDAP1
container.authentication.type=oauth2
container.authentication.oauth2.grantType=authorization_code
container.authentication.oauth2.clientId=bc10ca8d-ac22-4c94-9b6a-d64949864fbf
container.authentication.oauth2.clientSecret=
container.authentication.oauth2.tokenEndpoint=${host}/oauth/token
container.authentication.oauth2.scope=openid email profile
container.authentication.oauth2.authorizationEndpoint=${host}/openid/login_page
container.authentication.oauth2.redirectUri=pega://com.pega.hybridclient`;

        const preStyle = {
            backgroundColor: '#eee',
            padding: 5
        };

        return (
            <div>
                <h1>Oauth2 server</h1>
                <hr/>
                <h3>Routes</h3>

                <table className="table">
                    <thead className="thead-dark">
                    <tr>
                        <th>route</th>
                        <th>description</th>
                        <th>app.property</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>{host}/oauth/token</td>
                        <td>Acquire tokens</td>
                        <td>container.authentication.oauth2.tokenEndpoint</td>
                    </tr>
                    <tr>
                        <td>{host}/oauth/tokeninfo</td>
                        <td>Information about token</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{host}/oauth/userinfo</td>
                        <td>Infomation about user</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{host}/openid/login_page</td>
                        <td>Authorization login page</td>
                        <td>container.authentication.oauth2.authorizationEndpoint</td>
                    </tr>

                    </tbody>
                </table>

                <h3>Example app.properties</h3>
                <div>
                    <strong>PRPC oauth2 configuration tutorial:</strong>
                    <a href="https://pega.app.box.com/notes/260275456730" target="_blank">Tutorial</a>
                    <br/><br/>
                </div>


                <strong>Plain oAuth2</strong>
                <pre style={preStyle}>{configuration1}</pre>

                <strong>OAuth2 with authorization code and PKCE</strong>
                <pre style={preStyle}>{configuration3}</pre>

                <strong>OAuth2 with authorization code and client secret</strong>
                <pre style={preStyle}>{configuration2}</pre>
                <hr/>
            </div>
        );
    }
}

export default Index;
