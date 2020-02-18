const MSSQLDalHelper = require('./lib/mssql/DalHelper');
const MYSQLDalHelper = require('./lib/mysql/DalHelper');

module.exports = (config)=>{
    if(config&&config.drive==='mysql'){
        return new MYSQLDalHelper().setConfig(config);
    }
    return new MSSQLDalHelper().setConfig(config);
};
