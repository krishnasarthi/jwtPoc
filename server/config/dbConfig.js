var mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit: 10,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.HOST,
});

module.exports = pool;
