'use strict';
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../config/appConfig.js');

var getPasswordHash = function(password) {
  bcrypt.genSalt(10, function(err, salt) {
    if (err) throw err;

    bcrypt.hash(password, salt, null, function(err, hash) {
      if (err) throw err;

      return hash;
    });
  });
};

var getPasswordHashSync = function(password) {
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  return hash;
};

var comparePassword = function(userPassword, password, callback) {
  bcrypt.compare(password, userPassword, callback);
};

var comparePasswordSync = function(userPassword, password, callback) {
  bcrypt.compareSync(password, userPassword);
};

var createToken = function(user_id, req) {
  var payload = {
    iss: req.hostname,
    sub: user_id,
    exp: moment()
      .add(1, 'days')
      .unix(),
  };

  return jwt.encode(payload, config.TOKEN_SECRET);
};

/**********************MIDDLEWARE************************** */
var ensureAuthenticated = function(req, res, next) {
  if (
    req.url == '/api/login' ||
    req.url == '/api/signup' ||
    req.url == '/api/auth/google'
  ) {
    return next();
  }

  if (!req.headers.authorization) {
    return res
      .status(401)
      .send({
        message: 'Please make sure your request has an Authorization header',
      });
  }

  var token = req.headers.authorization.split(' ')[1];
  try {
    var payload = jwt.decode(token, config.TOKEN_SECRET);
  } catch (err) {
    return res.status(401).send({ message: err.message });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }

  req.user = payload.sub;
  next();
};

var setAccessControl = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
};

module.exports = {
  getPasswordHash: getPasswordHash,
  getPasswordHashSync: getPasswordHashSync,
  comparePassword: comparePassword,
  comparePasswordSync: comparePasswordSync,
  createToken: createToken,
  ensureAuthenticated: ensureAuthenticated,
  setAccessControl: setAccessControl,
};
