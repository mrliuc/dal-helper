var config = require('./config');

var dalHelper = require('../dalHelper').setConfig(config);


var option = {
    table: 'Test',
    //  whereAnd: { Id: 1 },
    whereOr: { Id: 2, Name: '1231' }
};

dalHelper.delete(option).exec(function(err, results, affected) {
    console.log(results);
    console.log(affected);
});


var option = {
    table: 'UserAccount',
    whereAnd: [
        ['Id', 100, '<'],
        ['Name', ['1']]
    ],
    // affected: 10000
}

dalHelper.select(option).exec(function(err, results, affected) {
    // console.log(err)
    console.log(affected)
    console.log(JSON.stringify(results))
})