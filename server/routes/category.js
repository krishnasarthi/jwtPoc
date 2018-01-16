var connectionPool = require('../config/dbConfig.js');
var common = require('../services/common.js');
var security = require('../services/security.js');

module.exports = function(app) {
  /* Create */
  app.post('/api/category', function(req, res) {
    connectionPool.getConnection(function(err, connection) {
      if (err) res.json(common.sendDbConnectionError(err));

      var category = {
        category_id: common.getSeqUUID(),
        user_id: req.user,
        name: req.body.name,
      };

      connection.query('insert into category SET ?', category, function(
        err,
        result
      ) {
        connection.release();
        if (err) {
          res.json({
            status: -1,
            message: 'Error in creating new category :' + err,
          });
        }
        res.json({
          status: 200,
          message: 'New Category created successfully...',
        });
      });
    });
  });

  /* GET */
  app.get('/api/category', function(req, res) {
    connectionPool.getConnection(function(err, connection) {
      if (err) res.json(common.sendDbConnectionError(err));

      connection.query(
        'select category_id,name from category where user_id = ?',
        req.user,
        function(err, rows) {
          connection.release();
          if (err) {
            res.json({
              status: -1,
              message: 'Error in fetching categories :' + err,
            });
          }
          res.json({ status: 200, data: rows });
        }
      );
    });
  });

  /* GET by ID */
  app.get('/api/category/:id', function(req, res) {
    connectionPool.getConnection(function(err, connection) {
      if (err) res.json(common.sendDbConnectionError(err));

      connection.query(
        'select category_id,name from category where category_id = ? ',
        [req.params.id],
        function(err, rows) {
          connection.release();
          if (err) {
            res.json({
              status: -1,
              message:
                'Error in fetching categories with category_id : ' +
                req.params.id +
                ',\n' +
                err,
            });
          }

          res.json({ status: 200, data: rows });
        }
      );
    });
  });

  /* DELETE Category */
  app.delete('/api/category/:id', function(req, res) {
    connectionPool.getConnection(function(err, connection) {
      if (err) res.json(common.sendDbConnectionError(err));

      connection.query(
        'delete from category where category_id = ?',
        req.params.id,
        function(err, result) {
          connection.release();
          if (err) {
            res.json({
              status: -1,
              message:
                'Error in deleting category with category_id : ' +
                req.params.id +
                ',\n' +
                err,
            });
          }

          res.json({ status: 200, message: 'Record deleted successfully' });
        }
      );
    });
  });

  /* Update Category */
  app.put('/api/category/:id', function(req, res) {
    connectionPool.getConnection(function(err, connection) {
      if (err) res.json(common.sendDbConnectionError(err));

      var category_id = req.params.id;
      var name = req.body.name;

      connection.query(
        'update category SET name = ? where category_id = ?',
        [name, category_id],
        function(err, result) {
          connection.release();
          if (err) {
            res.json({
              status: -1,
              message:
                'Error in updating category with category_id : ' +
                req.params.id +
                ',\n' +
                err,
            });
          }

          res.json({
            status: 200,
            message:
              'Successfully updated Category with category_id ' + category_id,
          });
        }
      );
    });
  });
};
