var express = require('express');
var bodyParser = require('body-parser');
var security = require('./services/security.js');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(security.setAccessControl);
app.use(security.ensureAuthenticated);

var user = require('./routes/user.js')(app);
var auth = require('./routes/auth.js')(app);
var category = require('./routes/category.js')(app);

var port = process.env.PORT || 8080;

var server = app.listen(port, function () {
    console.log('Server running at http://127.0.0.1:' + port);
});