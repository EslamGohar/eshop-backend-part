"use strict";

var _require = require('../database/models/user.model'),
    User = _require.User;

var express = require('express');

var router = express.Router();

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken'); // a list of all users without password


router.get('/', function _callee(req, res) {
  var userList;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(User.find().select('-password'));

        case 2:
          userList = _context.sent;

          if (!userList) {
            res.status(500).json({
              success: false
            });
          }

          res.send(userList);

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
}); // Register for Admin - create new user

router.post('/', function _callee2(req, res) {
  var user;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.t0 = User;
          _context2.t1 = req.body.name;
          _context2.t2 = req.body.email;
          _context2.t3 = bcrypt;
          _context2.next = 6;
          return regeneratorRuntime.awrap(req.body.password);

        case 6:
          _context2.t4 = _context2.sent;
          _context2.t5 = _context2.t3.hashSync.call(_context2.t3, _context2.t4, 10);
          _context2.t6 = req.body.phone;
          _context2.t7 = req.body.isAdmin;
          _context2.t8 = req.body.street;
          _context2.t9 = req.body.apartment;
          _context2.t10 = req.body.zip;
          _context2.t11 = req.body.city;
          _context2.t12 = req.body.country;
          _context2.t13 = {
            name: _context2.t1,
            email: _context2.t2,
            password: _context2.t5,
            phone: _context2.t6,
            isAdmin: _context2.t7,
            street: _context2.t8,
            apartment: _context2.t9,
            zip: _context2.t10,
            city: _context2.t11,
            country: _context2.t12
          };
          user = new _context2.t0(_context2.t13);
          _context2.next = 19;
          return regeneratorRuntime.awrap(user.save());

        case 19:
          user = _context2.sent;

          if (user) {
            _context2.next = 24;
            break;
          }

          return _context2.abrupt("return", res.status(400).send({
            success: false,
            message: "the user cannot be created"
          }));

        case 24:
          res.status(200).send({
            success: true,
            data: user,
            message: "User is created!"
          });

        case 25:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // get one single user by ID

router.get('/:id', function _callee3(req, res) {
  var user;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.params.id).select('-password'));

        case 2:
          user = _context3.sent;

          if (user) {
            _context3.next = 5;
            break;
          }

          return _context3.abrupt("return", res.status(404).send({
            success: false,
            data: message,
            message: "the user with the given id is not found"
          }));

        case 5:
          res.status(200).send({
            success: true,
            data: user
          });

        case 6:
        case "end":
          return _context3.stop();
      }
    }
  });
}); // update a specific user by id with/without password

router.put('/:id', function _callee4(req, res) {
  var userExit, newPassword, user;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.params.id));

        case 2:
          userExit = _context4.sent;

          if (req.body.password) {
            newPassword = bcrypt.hashSync(req.body.password, 10);
          } else {
            newPassword = userExit.password;
          }

          _context4.next = 6;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            email: req.body.email,
            password: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country
          }, {
            "new": true
          } // return the new updated data
          ));

        case 6:
          user = _context4.sent;

          if (user) {
            _context4.next = 9;
            break;
          }

          return _context4.abrupt("return", res.status(404).send({
            success: false,
            message: "this user cannot be updated"
          }));

        case 9:
          res.status(200).send({
            success: true,
            data: user,
            message: "the user is updated!"
          });

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // login user and create a token

router.post('/login', function _callee5(req, res) {
  var user, secret, token;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.body.email
          }));

        case 2:
          user = _context5.sent;
          secret = process.env.secret;

          if (user) {
            _context5.next = 6;
            break;
          }

          return _context5.abrupt("return", res.status(404).send({
            success: false,
            message: "the user not found"
          }));

        case 6:
          if (!(user && bcrypt.compare(req.body.password, user.password))) {
            _context5.next = 11;
            break;
          }

          token = jwt.sign({
            userId: user.id,
            isAdmin: user.isAdmin
          }, secret, // like password to create token
          {
            expiresIn: '2m'
          } // expire time to clear token after 1month
          );
          return _context5.abrupt("return", res.status(200).send({
            success: true,
            user: user.email,
            token: token
          }));

        case 11:
          return _context5.abrupt("return", res.status(404).send({
            success: false,
            message: "password is wrong"
          }));

        case 12:
        case "end":
          return _context5.stop();
      }
    }
  });
}); // Register for User - create new user 

router.post('/register', function _callee6(req, res) {
  var user;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.t0 = User;
          _context6.t1 = req.body.name;
          _context6.t2 = req.body.email;
          _context6.t3 = bcrypt;
          _context6.next = 6;
          return regeneratorRuntime.awrap(req.body.password);

        case 6:
          _context6.t4 = _context6.sent;
          _context6.t5 = _context6.t3.hashSync.call(_context6.t3, _context6.t4, 10);
          _context6.t6 = req.body.phone;
          _context6.t7 = req.body.isAdmin;
          _context6.t8 = req.body.street;
          _context6.t9 = req.body.apartment;
          _context6.t10 = req.body.zip;
          _context6.t11 = req.body.city;
          _context6.t12 = req.body.country;
          _context6.t13 = {
            name: _context6.t1,
            email: _context6.t2,
            password: _context6.t5,
            phone: _context6.t6,
            isAdmin: _context6.t7,
            street: _context6.t8,
            apartment: _context6.t9,
            zip: _context6.t10,
            city: _context6.t11,
            country: _context6.t12
          };
          user = new _context6.t0(_context6.t13);
          _context6.next = 19;
          return regeneratorRuntime.awrap(user.save());

        case 19:
          user = _context6.sent;

          if (user) {
            _context6.next = 24;
            break;
          }

          return _context6.abrupt("return", res.status(400).send({
            success: false,
            message: "the user cannot be created"
          }));

        case 24:
          res.status(200).send({
            success: true,
            data: user,
            message: "User is created!"
          });

        case 25:
        case "end":
          return _context6.stop();
      }
    }
  });
}); // delete a specific user by ID

router["delete"]('/:id', function _callee7(req, res) {
  var user;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return regeneratorRuntime.awrap(User.findByIdAndRemove(req.params.id));

        case 3:
          user = _context7.sent;

          if (!user) {
            _context7.next = 8;
            break;
          }

          return _context7.abrupt("return", res.status(200).send({
            success: true,
            data: user,
            message: "User is deleted"
          }));

        case 8:
          return _context7.abrupt("return", res.status(404).send({
            success: false,
            data: message,
            message: "user cannot be deleted!"
          }));

        case 9:
          _context7.next = 14;
          break;

        case 11:
          _context7.prev = 11;
          _context7.t0 = _context7["catch"](0);
          return _context7.abrupt("return", res.status(500).send({
            success: false,
            error: _context7.t0
          }));

        case 14:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 11]]);
}); // Show to the Admin how many users on the store.

router.get('/get/count', function _callee8(req, res) {
  var userCount;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return regeneratorRuntime.awrap(User.countDocuments());

        case 2:
          userCount = _context8.sent;

          if (!userCount) {
            res.status(500).json({
              success: false,
              message: "Cannot count the users.."
            });
          }

          res.status(200).send({
            success: true,
            userCount: userCount,
            message: "the number of user is ".concat(userCount, " on the store.")
          });

        case 5:
        case "end":
          return _context8.stop();
      }
    }
  });
});
module.exports = router;