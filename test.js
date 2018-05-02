var dalHelper = require('./dalHelper.js');

dalHelper.setConfig({
    user: 'sa',
    password: 'l111111.',
    server: '127.0.0.1',
    database: 'TransportPlatform',
    port: 1433,
    options: {
        useUTC: false,
        encrypt: true
    },
    pool: {
        min: 0,
        max: 1,
        idleTimeoutMillis: 3000
    }
});


// dalHelper.exec('select 1', {}, function(err, results) {
//     console.log(results);
// })

// return;
//测试select------------------------------------------------------------------------------------------------------
// var option = {
//     columns: ['Account', 'Mobile'],
//     table: 'UserAccount',
//     whereAnd: { Id: [1, 2] },
//     whereOr: {}
// };

//var option = {
//    columns: ['Id', 'OrderStatus'],
//    table: 'Order',
//    whereAnd: { OrderStatus: 6 },
//    whereOr: { OrderNo: 'GR17060019', MergeOrderNo: 'GR17060019' }
//};


//var option = {
//    columns: ['Id', 'OrderStatus'],
//    table: 'Order',
//  //  whereAnd: { OrderStatus: 6 },
//    whereAnd: [['OrderNo', 'GR17060019', 'like'],['MergeOrderNo', 'GR17060019'] ]
//};

// dalHelper.select(option).exec(function(err, results) {
//     console.log(results);
//     // console.log(results.recordsets[0][0]);

//     console.log(JSON.stringify(results))
// });

// dalHelper.dmls([{
//     DMLType: dalHelper.DMLType.SELECT,
//     columns: ['Account', 'Mobile'],
//     table: 'UserAccount',
//     whereAnd: { Id: [1, 2] },
// }, {
//     DMLType: dalHelper.DMLType.SELECT,
//     columns: ['Account', 'Mobile'],
//     table: 'UserAccount',
//     whereAnd: { Id: [1, 2] },
// }]).exec(function(err, results) {
//     console.log(results);
//     // console.log(results.recordsets[0][0]);

//     console.log(JSON.stringify(results))
// });

//测试insert------------------------------------------------------------------------------------------------------

// var option = {
//     data: { Name: "wwwwwwwwww" },
//     table: 'Test',
//     identity: true
// };

//dalHelper.insert(option).exec(function (err, results,affected) {
//    console.log(results);
//    console.log(affected);
//});

// dalHelper.dmls([

//     {
//         DMLType: dalHelper.DMLType.INSERT,
//         data: { Name: "1111111111111111111111111" },
//         table: 'Test',
//         identity: true
//     }, {
//         DMLType: dalHelper.DMLType.INSERT,
//         data: { Name: '@Test_Id' },
//         table: 'Test',
//         //identity: true
//     }, {
//         DMLType: dalHelper.DMLType.UPDATE,
//         data: { '@Name': '@Test_Id' },
//         table: 'Test',
//         whereAnd: [
//                 ['Name', '@Test_Id', '>']
//             ]
//             //  identity: true
//     },
//     // {
//     //    DMLType: dalHelper.DMLType.DELETE,
//     //    table: 'Test',
//     //    whereAnd: { Id: 30 },
//     //  //  affected: 1
//     //}
// ]).exec(function(err, results, affected) {
//     console.log(results);
//     console.log(affected);
// });

//测试update------------------------------------------------------------------------------------------------------
//var option = {
//    data: { Name: 'sdaf' },
//    table: 'Test',
//    //whereAnd: { Id: 1 },
//    whereOr: { Id: 2, Name: '1231' }
//};

//dalHelper.update(option).exec(function (err, results, affected) {
//    console.log(results);
//    console.log(affected);
//});


//测试delete------------------------------------------------------------------------------------------------------
//var option = {
//    table: 'Test',
//  //  whereAnd: { Id: 1 },
//    whereOr: { Id: 2, Name: '1231' }
//};

//dalHelper.delete(option).exec(function (err, results, affected) {
//    console.log(results);
//    console.log(affected);
//});


var option = {
    table: 'UserAccount',
    whereAnd: [
        ['Id', 100, '<']
    ]
}

dalHelper.count(option).exec(function(err, results) {
    console.log(results)
})