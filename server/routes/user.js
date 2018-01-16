var connectionPool = require('../config/dbConfig.js');
var common = require('../services/common.js');
var security = require('../services/security.js');

module.exports = function(app) {
  /* Register User */
  app.post('/api/signup', function(req, res) {
    var id = common.getSeqUUID();
    var password_hash = security.getPasswordHashSync(req.body.password);

    var newUser = {
      user_id: id,
      email: req.body.email,
      password: password_hash,
    };

    connectionPool.getConnection(function(err, connection) {
      if (err) {
        res.json(common.sendDbConnectionError(err));
        return;
      }

      connection.query('insert into user SET ?', newUser, function(
        err,
        result
      ) {
        connection.release();
        if (err) {
          res.status(-1).send({ message: err });
          return;
        }

        var token = security.createToken(id, req);
        res.status(200).send({ token: token });
      });
    });
  });

  /* User Login */
  app.post('/api/login', function(req, res) {
    var user = req.body;

    connectionPool.getConnection(function(err, connection) {
      if (err) {
        res.json(common.sendDbConnectionError(err));
        return;
      }

      connection.query(
        'select user_id,email,password from user where email = ?',
        user.email,
        function(err, row) {
          connection.release();
          if (err) {
            res.status(-1).send({ message: err });
            return;
          }

          if (!row || row.length == 0) {
            res
              .status(-1)
              .send({ message: 'No user with email : ' + user.email });
            return;
          }

          var password = row[0].password;

          security.comparePassword(password, user.password, function(
            err,
            isMatch
          ) {
            if (err) {
              res.status(-1).send({ message: err });
              return;
            }

            if (!isMatch) {
              res.status(-1).send({ message: 'Invalid password' });
              return;
            }

            var token = security.createToken(row[0].user_id, req);
            res.status(200).send({ token: token });
          });
        }
      );
    });
  });
};
