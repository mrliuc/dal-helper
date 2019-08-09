var MSSQLDalHelper = require('./MSSQLDalHelper');
var MYSQLDalHelper = require('./MYSQLDalHelper');

var dal = new MSSQLDalHelper();

dal.MYSQL = new MYSQLDalHelper();

module.exports = dal;