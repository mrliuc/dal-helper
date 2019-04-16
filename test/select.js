var config = require('./config');

var dalHelper = require('../dalHelper').setConfig(config);

var dalHelper2 = require('../dalHelper').setConfig(config);

// for (var i = 0; i < 100; i++) {

//     (async(i) => {
//         var b = await dalHelper.dmls([{
//             DMLType: dalHelper.DMLType.SELECT,
//             columns: ['Account', 'Mobile'],
//             table: 'UserAccount',
//             whereAnd: { Id: [1, 2] },
//         }, {
//             DMLType: dalHelper.DMLType.SELECT,
//             columns: ['Account', 'Mobile'],
//             table: 'UserAccount',
//             whereAnd: { Id: [1, 2] },
//         }]).exec(function(err, results) {
//             // console.log(results, 1);
//             // // console.log(results.recordsets[0][0]);

//             // console.log(JSON.stringify(results))
//         })
//         console.log(b, i)
//     })(i);


//     (async(i) => {
//         var b = await dalHelper2.select({
//             columns: ['Account', 'Mobile'],
//             table: 'UserAccount',
//             whereAnd: { Id: [1, 2] },
//         }).exec(function(err, results) {
//             // console.log(results, 3);
//             // // console.log(results.recordsets[0][0]);

//             // console.log(JSON.stringify(results))
//         })
//         console.log(b, i)
//     })(i);

// }


(async(i) => {
    var b = await dalHelper.query('select top 1 * from UserAccount', function(err, results) {
        // console.log(results, 3);
        // // console.log(results.recordsets[0][0]);

        // console.log(JSON.stringify(results))
    })
    console.log(b, i)
})(10);