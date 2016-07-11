var uuid = require('node-uuid');
var _ = require('lodash');

/* Return unique sequential UUID for tables */
var getSeqUUID = function () {
    return _.replace(uuid.v1(), new RegExp('-', 'g'), '');
}

var sendDbConnectionError = function (err) {
    return { "status": -1, "message": "Error in connecting database :" + err };
}

module.exports = {
    getSeqUUID : getSeqUUID,
    sendDbConnectionError : sendDbConnectionError
};