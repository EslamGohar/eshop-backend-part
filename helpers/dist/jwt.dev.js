"use strict";

// to secure the api and authentication 
var expressJwt = require("express-jwt");

function authJwt() {
  var secret = process.env.secret;
  var api = process.env.API_URL;
  return expressJwt({
    secret: secret,
    algorithms: ['HS256'],
    credentialsRequired: false,
    ignoreExpiration: true,
    isRevoked: isRevoked
  }).unless({
    // for unprotected tokens, anyone can authorize them.
    path: [{
      url: /\/public\/uploads(.*)/,
      methods: ['GET', 'OPTIONS']
    }, {
      url: /\/api\/v1\/products(.*)/,
      methods: ['GET', 'OPTIONS']
    }, {
      url: /\/api\/v1\/categories(.*)/,
      methods: ['GET', 'OPTIONS']
    }, {
      url: /\/api\/v1\/orders(.*)/,
      methods: ['GET', 'OPTIONS', 'POST']
    }, "".concat(api, "users/login"), "".concat(api, "users/register") //{url: /(.*)/ }
    ]
  });
}

function isRevoked(req, payload, done) {
  var userType;
  return regeneratorRuntime.async(function isRevoked$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // payload contains the data inside the token  
          userType = payload.isAdmin;

          if (userType) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", done(null, true));

        case 3:
          done();

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
}

module.exports = authJwt;