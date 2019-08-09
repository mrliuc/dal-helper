var config = require('../mysql_config');

var dalHelper = require('../../index').MYSQL.setConfig(config);


var option = {
    data: { Name: "wwwwwwwwww" },
    table: 'Test',
    // identity: true
};


// (async() => {
//     var a = await dalHelper.insert(option).exec(function(err, results, affected) {
//         // console.log(results);
//         // console.log(affected);
//     })

//     console.log(a)
// })();

// dalHelper.dmls([{
//     DMLType: dalHelper.DMLType.INSERT,
//     data: { Name: "11111111" },
//     table: 'Test',
// }]).exec((err, results) => {
//     console.log(err, results)
// });

// return;


dalHelper.dmls([

    {
        DMLType: dalHelper.DMLType.INSERT,
        data: { Name: "11111111" },
        table: 'Test',
        identity: true
    },
    {
        DMLType: dalHelper.DMLType.UPDATE,
        data: { '@Name': '@Test_Id' },
        table: 'Test',
        whereAnd: [
                ['@Id', '@Test_Id']
            ]
            //  identity: true
    },
    {
        DMLType: dalHelper.DMLType.INSERT,
        data: { 'Mobile': new Date().getTime() + '' },
        table: 'Test2',
    },
    {
        DMLType: dalHelper.DMLType.INSERT,
        data: { '@Name': '@Test_Id' },
        table: 'Test',
        affected: 1,
        identity: true
    },
    {
        DMLType: dalHelper.DMLType.DELETE,
        table: 'Test',
        whereAnd: { Id: 37 },
        //  affected: 1
    }
]).exec(function(err, results, affected) {
    console.log(results, affected);
}, true);



// dalHelper.dmls([

//     {
//         DMLType: dalHelper.DMLType.INSERT,
//         data: { Name: "11111111" },
//         table: 'Test',
//         identity: true
//     }, {
//         DMLType: dalHelper.DMLType.INSERT,
//         data: { Name: '@Test_Id' },
//         table: 'Test',
//         affected: 1
//             //identity: true
//     },
//     {
//         DMLType: dalHelper.DMLType.UPDATE,
//         data: { '@Name': '@Test_Id' },
//         table: 'Test',
//         whereAnd: [
//                 ['@Name', '@Test_Id', '>']
//             ]
//             //  identity: true
//     },
//     {
//         DMLType: dalHelper.DMLType.DELETE,
//         table: 'Test',
//         whereAnd: { Id: 30 },
//         //  affected: 1
//     }
// ]).exec(function(err, results, affected) {
//     console.log(results, affected);
// });