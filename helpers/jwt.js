// after the user login the eshop, he was assigned a token.
// this token is overloaded with userId and isAdmin
// when sending req the JWT lib disassembling بتفكك this token with the secretcode,
// jwt will see if it's generated from this server or no. 
// only Admin and login users who can add/delete/update products. 
// isRevoked: specify if the user is admin or not.


// to secure the api and authentication 
const expressJwt = require("express-jwt")

function authJwt() {
    const secret = process.env.secret
    const api = process.env.API_URL

    return expressJwt({
        secret,
        algorithms: ['HS256'],
        credentialsRequired: false,
        ignoreExpiration: true,
        isRevoked: isRevoked
    }).unless({     // for unprotected tokens, anyone can authorize them.
        path: [
            {url: /\/public\/uploads(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/products(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/orders(.*)/ , methods: ['GET', 'OPTIONS', 'POST'] },
            `${api}users/login`,
            `${api}users/register`,
            //{url: /(.*)/ }
        ]
    })
}

async function isRevoked(req, payload, done) {  // payload contains the data inside the token  
    const userType = payload.isAdmin
    if(!userType) {
        return done(null, true)    // if the user is not admin, the token will be rejected!
    }
    done()
}

module.exports = authJwt