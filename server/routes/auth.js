var connectionPool = require('../config/dbConfig.js');
var common = require('../services/common.js');
var security = require('../services/security.js');
var config = require('../config/appConfig.js');
var request = require('request');

module.exports = function(app) {
  /* Google Authentication */
  app.post('/api/auth/google', function(req, res) {
    var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    var peopleApiUrl =
      'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.GOOGLE_SECRET,
      redirect_uri: req.body.redirectUri,
      grant_type: 'authorization_code',
    };

    // Step 1. Exchange authorization code for access token.
    request.post(accessTokenUrl, { json: true, form: params }, function(
      err,
      response,
      token
    ) {
      var accessToken = token.access_token;
      var headers = { Authorization: 'Bearer ' + accessToken };

      // Step 2. Retrieve profile information about the current user.
      request.get({ url: peopleApiUrl, headers: headers, json: true }, function(
        err,
        response,
        profile
      ) {
        if (profile.error) {
          return res.status(500).send({ message: profile.error.message });
        }

        connectionPool.getConnection(function(err, connection) {
          if (err) return common.sendDbConnectionError();
          // Step 3a. Link user accounts.
          if (req.header('Authorization')) {
            connection.query(
              'select user_id,email,password from user where google_id = ?',
              profile.sub,
              function(err, existingUser) {
                if (existingUser) {
                  return res
                    .status(409)
                    .send({
                      message:
                        'There is already a Google account that belongs to you',
                    });
                }

                var token = req.header('Authorization').split(' ')[1];
                var payload = jwt.decode(token, config.TOKEN_SECRET);

                connection.query(
                  'select user_id,email,password from user where user_id = ?',
                  payload.sub,
                  function(err, user) {
                    if (!user) {
                      return res
                        .status(400)
                        .send({ message: 'User not found' });
                    }

                    connection.query(
                      'update user SET google_id = ?',
                      profile.sub,
                      function(err, result) {
                        if (err) {
                          return res.status(400).send({ message: err });
                        }
                        var token = security.createToken(user.user_id, req);
                        res.status(200).send({ token: token });
                      }
                    );
                  }
                );
              }
            );
          } else {
            // Step 3b. Create a new user account or return an existing one.
            connection.query(
              'select user_id,email,password from user where google_id = ?',
              profile.sub,
              function(err, existingUser) {
                if (err) {
                  return res.status(400).send({ message: err });
                }
                if (existingUser && existingUser.length > 0) {
                  return res.send({
                    token: security.createToken(existingUser.user_id, req),
                  });
                }

                var newUser = {
                  user_id: common.getSeqUUID(),
                  google_id: profile.sub,
                };

                connection.query('insert into user SET ?', newUser, function(
                  err,
                  result
                ) {
                  if (err) {
                    return res.status(400).send({ message: err });
                  }

                  var token = security.createToken(newUser.user_id, req);
                  res.status(200).send({ token: token });
                });
              }
            );
          }
          connection.release();
        });
      });
    });
  });
};
