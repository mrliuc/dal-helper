var config = require('./config');

var dalHelper = require('../dalHelper').setConfig(config);

var option = {
    data: { Name: 'sdaf' },
    table: 'Test',
    whereAnd: { Id: 1 },
    whereOr: { Id: 2, Name: '1231' }
};

dalHelper.update(option).exec(function(err, results, affected) {
    console.log(results);
    console.log(affected);
});