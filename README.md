# OAuth2 server

1. **Running server**

     Server is running on port 3000

    `npm install`
    
    `npm build`

    `npm start`
   
2. **Adding users**

    To add new user edit data/users.json
    
3. **Configuring PRPC to use this server**

    For example this server is running on http://example.com:3000
    
    In PRPC add fallowing dynamic system settings: 
    
     **Owning ruleset:** Pega-AppDefinition
    
     **Setting Purpose - Value**
    
      authentication_type - oauth2
     
      OAuth2/scope - email profile
     
      OAuth2/grant_type - Password
     
      OAuth2/token_endpoint - http://example.com:3000/oauth/token
     
      OAuth2/userinfo_url - http://example.com:3000/oauth/userinfo
     
      OAuth2/tokeninfo_url - http://example.com:3000/oauth/tokeninfo
     
      OAuth2/client_id - bc10ca8d-ac22-4c94-9b6a-d64949864fbf
     
      OAuth2/client_secret - 3-UZLSbd3KkowE0NsF78IkhWmico8Uit8wTIh5TcF7UAU2cxYfav7IJwvn5EnU0HpODz70QMdEPoFcu4I-UZYw

#### Oauth endpoints

`POST /oauth/token`

`GET /oauth/tokeninfo`

`GET /aouth/userinfo`

#### Helpers

`GET /index.html` - GUI to manage server settings


#### Run tests

`npm test`