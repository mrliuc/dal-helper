var config = require('../mysql_config');

var dalHelper = require('../../index').MYSQL.setConfig(config);



var option = {
    table: 'Test',
    //  whereAnd: { Id: 1 },
    whereOr: [
        ['Id', 40, '<']
    ]
};

dalHelper.delete(option).exec(function(err, results, affected) {
    console.log(results, affected);
});

return
var option = {
    table: 'Test',
    whereAnd: [
        ['Id', 40, '<'],
    ],
    // affected: 10000
}

dalHelper.select(option).exec(function(err, results, affected) {
    // console.log(err)
    console.log(affected)
    console.log(JSON.stringify(results))
})