"use strict";

var async = require("async");
var mssql = require("mssql");
var util = require("util");
var moment = require("moment");
// var logger = require("./common/logger");

// var config = require("./config").sql_config;
var db = {};

var config;

db.setConfig = function(cfg) {
    config = cfg;
};

//Connection
var createConnection = function(args, callback) {
    args.connection = new mssql.Connection(config, function(err) {
        callback(err, args);
    });
};
//Transaction
var createTransaction = function(args, callback) {
    args.transaction = new mssql.Transaction(args.connection);

    callback(null, args);
};
//PreparedStatement
var createPreparedStatement = function(args, callback) {

    args.ps = new mssql.PreparedStatement(args.transaction ? args.transaction : args.connection);
    args.ps.multiple = true;
    callback(null, args);
};
//InputParams
var makeParams = function(args, callback) {

    if (args.inputParams) {
        Object.keys(args.inputParams).forEach(function(key) {
            //console.log(key);
            //console.log(typeof inputParams[key]);
            switch (typeof args.inputParams[key]) {
                case "string":
                    if (args.inputParams[key].length > 2000) {
                        args.ps.input(key, mssql.NText, args.inputParams[key]);

                    } else {
                        args.ps.input(key, mssql.NVarChar(args.inputParams[key].length + 50), args.inputParams[key]);
                    }
                    // console.log( params[key]);

                    break;
                case "number":
                    if (/^-?\d+$/.test(args.inputParams[key])) {
                        args.ps.input(key, mssql.Int, args.inputParams[key]);
                    } else if (/^(-?\d+)\.\d{1,2}$/.test(args.inputParams[key])) {
                        args.ps.input(key, mssql.Decimal(18, 2), args.inputParams[key]);
                    } else {
                        args.ps.input(key, mssql.Float, args.inputParams[key]);
                    }

                    // console.log( params[key]);

                    break;
                case "object":

                    if (util.isDate(args.inputParams[key])) {
                        //args.ps.input(key, mssql.NVarChar(50), moment(args.inputParams[key]).format('YYYY-MM-DD HH:MM:ss.SSS'));

                        //var date = args.inputParams[key];
                        //console.log(date);
                        //date.setHours(date.getHours() + 8);
                        args.ps.input(key, mssql.DateTime, args.inputParams[key]);

                    } else if (args.inputParams[key] === null) {
                        args.ps.input(key, mssql.NVarChar(50), args.inputParams[key]);
                    } else if (args.inputParams[key] instanceof Array) {

                        let paramName = '@' + key;
                        let tableName = '@t_' + key;
                        let tempSql = '';
                        switch (typeof args.inputParams[key][0]) {
                            case "string":
                                tempSql = "declare " + tableName + " table(v nvarchar(50));insert into " + tableName + " select v from [fn_Split](" + paramName + ",',');";
                                break;
                            case "number":
                                {
                                    if (/^-?\d+$/.test(args.inputParams[key])) {
                                        tempSql = " declare " + tableName + " table(v int);insert into " + tableName + " select convert(int,v) v from [fn_Split](" + paramName + ",',');";
                                    } else if (/^(-?\d+)\.\d{1,2}$/.test(args.inputParams[key])) {
                                        tempSql = " declare " + tableName + " table(v decimal(18,2));insert into " + tableName + " select convert(decimal(18,2),v) v from [fn_Split](" + paramName + ",',');";
                                    } else {

                                        tempSql = " declare " + tableName + " table(v float);insert into " + tableName + " select convert(float,v) v from [fn_Split](" + paramName + ",',');";
                                    }
                                }
                                break;

                            default:
                                throw new Error("sql参数异常:" + key + ':' + JSON.stringify(args.inputParams[key]) + '    SQL:' + args.sql);
                        }
                        var reg = new RegExp('@' + key, "g");
                        args.sql = tempSql + args.sql.replace(reg, 'select v from ' + tableName);

                        var paramStr = args.inputParams[key].join(',');

                        // if (paramStr.length > 2000) {
                        //     throw 'sql参数过长：' + paramStr;
                        // }

                        args.ps.input(key, mssql.NVarChar(mssql.MAX), paramStr);
                    }

                    break;
                default:
                    args.ps.input(key, mssql.NVarChar(50), null);

            }

        });

        //console.log(args.inputParams);
        //console.log(args.sql);

    }

    if (args.outputParams) {
        Object.keys(args.outputParams).forEach(function(key) {

            switch (typeof args.outputParams[key]) {
                case "string":
                    args.ps.output(key, mssql.NVarChar(50));
                    break;
                case "number":
                    if (/^(-?\d+)\.\d+$/.test(args.inputParams[key])) {
                        args.ps.output(key, mssql.Decimal(18, 2));
                    } else {
                        args.ps.output(key, mssql.Int);
                    }
                    break;
                case "object":

                    if (util.isDate(args.inputParams[key])) {
                        args.ps.output(key, mssql.DateTime);
                    } else if (args.inputParams[key] === null) {
                        args.ps.output(key, mssql.NVarChar(50));
                    }

                    break;
            }
        });

    }

    callback(null, args);
};
//transactionBegin
var transactionBegin = function(args, callback) {
    args.transaction.begin(mssql.ISOLATION_LEVEL.READ_UNCOMMITTED, function(err) {
        callback(err, args);
    });
};

var psPrepare = function(args, callback) {
    args.ps.prepare(args.sql, function(err) {
        callback(err, args);
    });
};

var psExecute = function(args, callback) {

    var params = args.outputParams ? Object.assign(args.inputParams, args.outputParams) : args.inputParams;

    args.ps.execute(params, function(err, result, affected) {
        args.result = result;
        args.affected = affected;
        callback(err, args);
    });
};

var psUnprepare = function(args, callback) {
    args.ps.unprepare(function(err) {
        callback(err, args);
    });
};

var makeOutParams = function(args, callback) {

    if (args.outputParams) {
        Object.keys(args.outputParams).forEach(function(key) {

            args.outputParams[key] = args.ps.lastRequest.parameters[key].value;
        });
    }

    callback(null, args);
};

var transactionEnd = function(err, transaction) {

    if (transaction) {

        if (err) {

            transaction.rollback(function(err) {
                if (err) {
                    throw err;
                }
            });

            throw err;
        }

        transaction.commit(function(err) {
            if (err) {
                throw err;
            }
        });
    }
};
var asyncCallback = function(err, args) {

    if (err) {
        if (args.ps) {
            psUnprepare(args, function() {});
        }
        console.log(err);
        // logger.error(err);
        // logger.error(args.sql);
        // logger.error(args.inputParams);
        // logger.error(args.outputParams);

        throw err;
    }

    transactionEnd(err, args.transaction);

    args.callBack(null, args.result, args.outputParams ? args.outputParams : args.affected);
};

//执行sql,返回数据.  
db.query = function(sql, params, callBack) {

    async.waterfall([
        function(callback) {
            callback(null, { sql: sql, inputParams: params, callBack: callBack });
        },
        createConnection,
        createTransaction,
        createPreparedStatement,
        makeParams,
        transactionBegin,
        psPrepare,
        psExecute,
        psUnprepare
    ], asyncCallback);

};

db.exec = function(sql, params, callBack) {

    async.waterfall([
        function(callback) {
            callback(null, { sql: sql, inputParams: params, callBack: callBack });
        },
        createConnection,
        createTransaction,
        createPreparedStatement,
        makeParams,
        transactionBegin,
        psPrepare,
        psExecute,
        psUnprepare
    ], asyncCallback);
};

db.proc = function(sql, inputParams, outputParams, callBack) {

    async.waterfall([
        function(callback) {
            callback(null, { sql: sql, inputParams: inputParams, outputParams: outputParams, callBack: callBack });
        },
        createConnection,
        createPreparedStatement,
        makeParams,
        psPrepare,
        psExecute,
        psUnprepare,
        makeOutParams
    ], asyncCallback);

};
//db.exec("select '1' as a; select '2' as b;", {}, function (err, results) {

//    console.log(results);

//});

//for (let i = 0; i < 1; i++) {
//    db.query("select '" + i + "' as a; select '" + i +"' as b where 0=@i;", {i:i}, function (err, results) {

//        console.log(results);

//    });
//}


//db.exec("select '2' as a; select '2' as b;", {}, function (err, results) {

//    console.log(results);

//});
//db.exec("select '3' as a; select '2' as b;", {}, function (err, results) {

//    console.log(results);

//});

//console.log(mssql.ISOLATION_LEVEL.READ_UNCOMMITTED);
// console.log(mssql.ISOLATION_LEVEL.READ_COMMITTED);

//db.exec("select top 1 * from [Order];", {}, function (err, results, affected) {

//    console.log('select---------'+results);

//});
//db.exec("update [Order] set [ContactName]='122' where Id=8;update [Order] set [ContactName]='123' where Id=8 or id=9", {}, function (err, results, affected) {

//    console.log('update---------'+results);
//    console.log(affected);

//});
//db.exec("update [Order] set [ContactName]='122' where Id=8;update [Order] set [ContactName]='123' where Id=8 or id=9", {}, function (err, results, affected) {

//    console.log('update---------' + results);
//    console.log(affected);

//});
//db.exec("select top 1 * from [Order];", {}, function (err, results, affected) {

//    console.log('select---------' + results);

//});

//db.query("select top 1 * from [Order];", {}, function (err, results, affected) {

//    console.log(results);
//    console.log(affected);

//});
//db.exec("select '1' as a; select '2' as b;", {}, function (err, results) {

//    console.log(results);

//});
//db.exec("select '1' as a; select '2' as b;", {}, function (err, results) {

//    console.log(results);

//});
//db.exec("select '1' as a; select '2' as b;", {}, function (err, results) {

//    console.log(results);

//});
//db.exec("select '1' as a; select '2' as b;", {}, function (err, results) {

//    console.log(results);

//});

//db.exec("insert into [test](Name) values('aaa')", {}, function (err, results) {

//   console.log(results);

//});

//db.exec("insert into Test(Name) values('aa');declare @OrderId int=@@IDENTITY  insert into Test2(Id) values(@OrderId);insert into Test2(Id) values(@OrderId);select @@IDENTITY id;", {}, function (err, results) {
//    console.log(results);
//});

//db.proc('exec [sp_GetSequenceNo] @SequenceType,1,1,9999,@SequenceNo output', { SequenceType: 1 }, { SequenceNo: 0 }, function (err, results, outputParams) {

//    console.log(outputParams.SequenceNo);

//});
module.exports = db;