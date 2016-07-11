var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10,
    user: 'krishna',
    password: 'aloha@123',
    database: 'expensedb'
});

module.exports = pool;