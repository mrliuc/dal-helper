var config = require('../mysql_config');

var dalHelper = require('../../index').MYSQL.setConfig(config);

var option = {
    data: { Name: 'sdaf' },
    table: 'Test',
    whereAnd: { Id: 40 },
    // whereOr: { Id: 2, Name: '1231' }
};

var exec = async() => {
    var affected = await dalHelper.update(option).exec(function(err, results, affected) {
        // console.log(results);
        // console.log(affected);
    });

    console.log(affected)
}

exec().then()