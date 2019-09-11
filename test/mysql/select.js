var config = require('../mysql_config');

var dalHelper = require('../../index').MYSQL.setConfig(config);

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


// (async(i) => {
//     var b = await dalHelper.query('select top 1 * from UserAccount', function(err, results) {
//         // console.log(results, 3);
//         // // console.log(results.recordsets[0][0]);

//         // console.log(JSON.stringify(results))
//     })
//     console.log(b, i)
// })(10);


// dalHelper.select({
//     table: 'Topic',
//     join: {
//         table: 'TopicInfo',
//         on: 'Topic.TopicNo=TopicInfo.TopicNo'
//     },
//     whereOr: { 'TopicInfo.CusContactPhone': '18812345678' }
// }).exec().then(res => false && console.log(res))

// dalHelper.select({
//     table: 'Topic',
//     join: {
//         table: 'TopicInfo',
//         on: 'Topic.TopicNo=TopicInfo.TopicNo'
//     },
//     whereAnd: [
//         ['TopicInfo.CusContactPhone', '18812345678']
//     ],
//     whereOr: [
//         ['TopicInfo.CusContactPhone', '18812345678']
//     ]
// }).exec().then(res => false && console.log(res))
var pageNo = 1,
    pageSize = 1;
// dalHelper.select({
//     table: 'Test',
//     // whereAnd: { Id: [40, 43, 44] }
//     whereAnd: { Name: ['43', '55'] },
//     page: { start: (pageNo - 1) * pageSize, length: pageSize },
//     orderByDescs: ['Id']
// }).exec((err, results, affected) => {
//     console.log(results, affected)
// }, true)

dalHelper.dmls([{
    DMLType: dalHelper.DMLType.SELECT,
    table: 'Test',
    // whereAnd: { Id: [40, 43, 44] }
    whereAnd: { Name: ['43', '55'] },
    page: { start: (pageNo - 1) * pageSize, length: pageSize },
    orderByDescs: ['Id']
}, {
    DMLType: dalHelper.DMLType.SELECT,
    table: 'Test',
    // whereAnd: { Id: [40, 43, 44] }
    whereAnd: { Name: ['43', '55'] },
}]).exec((err, results, affected) => {
    console.log(results, affected)
}, true)