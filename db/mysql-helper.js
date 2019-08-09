"use strict";

var async = require("async");
var mysql = require("mysql");
var util = require("util");
var moment = require("moment");
// var logger = require("./common/logger");

// var config = require("./config").sql_config;


class MYSQLHelper {

    constructor(config) {
        this.config = config;

        this.pool = mysql.createPool(config);

        this.query = async(sql, params, callback) => this.proc(sql, params, null, callback);
        this.proc = async(sql, inputParams, outputParams, callback) => this._proc(sql, inputParams, outputParams, callback);
    }

    async makeParams(ps, sql, inputParams, outputParams) {
        //InputParams
        if (inputParams) {
            Object.keys(inputParams).forEach(function(key) {
                //console.log(key);
                //console.log(typeof inputParams[key]);
                switch (typeof inputParams[key]) {
                    case "string":
                        if (inputParams[key].length > 2000) {
                            ps.input(key, mysql.NText, inputParams[key]);

                        } else {
                            ps.input(key, mysql.NVarChar(inputParams[key].length + 50), inputParams[key]);
                        }
                        // console.log( params[key]);

                        break;
                    case "number":
                        if (/^-?\d+$/.test(inputParams[key])) {
                            ps.input(key, mysql.Int, inputParams[key]);
                        } else if (/^(-?\d+)\.\d{1,2}$/.test(inputParams[key])) {
                            ps.input(key, mysql.Decimal(18, 2), inputParams[key]);
                        } else {
                            ps.input(key, mysql.Float, inputParams[key]);
                        }

                        // console.log( params[key]);

                        break;
                    case "object":

                        if (util.isDate(inputParams[key])) {
                            //ps.input(key, mysql.NVarChar(50), moment(inputParams[key]).format('YYYY-MM-DD HH:MM:ss.SSS'));

                            //var date = inputParams[key];
                            //console.log(date);
                            //date.setHours(date.getHours() + 8);
                            ps.input(key, mysql.DateTime, inputParams[key]);

                        } else if (inputParams[key] === null) {
                            ps.input(key, mysql.NVarChar(50), inputParams[key]);
                        } else if (inputParams[key] instanceof Array) {

                            let paramName = '' + key;
                            let tableName = 't_' + key;
                            let tempSql = '';
                            switch (typeof inputParams[key][0]) {
                                case "string":
                                    tempSql = "declare " + tableName + " table(v nvarchar(50));insert into " + tableName + " select v from [fn_Split](" + paramName + ",',');";
                                    break;
                                case "number":
                                    {
                                        if (/^-?\d+$/.test(inputParams[key])) {
                                            tempSql = " declare " + tableName + " table(v int);insert into " + tableName + " select convert(int,v) v from [fn_Split](" + paramName + ",',');";
                                        } else if (/^(-?\d+)\.\d{1,2}$/.test(inputParams[key])) {
                                            tempSql = " declare " + tableName + " table(v decimal(18,2));insert into " + tableName + " select convert(decimal(18,2),v) v from [fn_Split](" + paramName + ",',');";
                                        } else {

                                            tempSql = " declare " + tableName + " table(v float);insert into " + tableName + " select convert(float,v) v from [fn_Split](" + paramName + ",',');";
                                        }
                                    }
                                    break;

                                default:
                                    Promise.reject("sql参数异常:" + key + ':' + JSON.stringify(inputParams[key]) + '    SQL:' + sql);
                            }
                            var reg = new RegExp(':' + key, "g");
                            sql = tempSql + sql.replace(reg, 'select v from ' + tableName);

                            var paramStr = inputParams[key].join(',');

                            // if (paramStr.length > 2000) {
                            //     throw 'sql参数过长：' + paramStr;
                            // }

                            ps.input(key, mysql.NVarChar(mysql.MAX), paramStr);
                        }

                        break;
                    default:
                        ps.input(key, mysql.NVarChar(50), null);

                }

            });


            //console.log(inputParams);
            //console.log(sql);

        }

        if (outputParams) {
            Object.keys(outputParams).forEach(function(key) {

                switch (typeof outputParams[key]) {
                    case "string":
                        ps.output(key, mysql.NVarChar(50));
                        break;
                    case "number":
                        if (/^(-?\d+)\.\d+$/.test(inputParams[key])) {
                            ps.output(key, mysql.Decimal(18, 2));
                        } else {
                            ps.output(key, mysql.Int);
                        }
                        break;
                    case "object":

                        if (util.isDate(inputParams[key])) {
                            ps.output(key, mysql.DateTime);
                        } else if (inputParams[key] === null) {
                            ps.output(key, mysql.NVarChar(50));
                        }

                        break;
                }
            });

        }

        return sql;
    };

    async exec(options, callback) {
        var connection, results = [],
            affected = 0;

        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                if (err) { return reject(err); }
                connection = conn
                connection.config.queryFormat = function(query, values) {
                    if (!values) return query;
                    let sql = query.replace(/\:(\w+)/g, function(txt, key) {
                        if (values.hasOwnProperty(key)) {
                            return this.escape(values[key]);
                        }
                        return txt;
                    }.bind(this));
                    // console.log(sql);
                    return sql;
                };
                return resolve();
            })
        }).then(() => {
            return new Promise((resolve, reject) => {
                connection.beginTransaction(err => {
                    if (err) { return reject(err); }
                    resolve();
                })
            })
        }).then(() => {
            return new Promise(async(resolve, reject) => {
                let identityParam = {};
                try {
                    for (let option of options) {
                        let result = await new Promise((resolve, reject) => {
                            connection.query(option.sql, Object.assign(option.param, identityParam), (err, res, fields) => {
                                if (err) { return reject([err, option]); }
                                // console.log(fields)
                                return resolve(res)
                            });
                        });

                        (result instanceof Array) && results.push(result);

                        result.affectedRows && (affected += result.affectedRows);

                        result.insertId > 0 && (identityParam[option.table + '_Id'] = result.insertId);

                        option.identity && results.push([{ Id: result.insertId }])

                        if (option.affected && result.affectedRows != option.affected) {
                            return reject(['affected error', result, option]);
                        }
                    }
                } catch (e) {
                    return reject(e);
                }

                return resolve();
            })
        }).then(() => {
            return new Promise((resolve, reject) => {
                connection.commit(err => {
                    if (err) { return reject(err); }
                    if (callback) {
                        setImmediate(() => {
                            callback(null, results, affected);
                        })
                    }

                    if (results.length == 0) {
                        return resolve(affected)
                    }
                    if (results.length == 1) {
                        return resolve(results[0])
                    }
                    return resolve(results)
                })
            })
        }).catch(err => {
            err && console.error(err);
            connection && connection.rollback(e => { if (e) { throw e } });
        });
    }

    async _proc(sql, inputParams, outputParams, callback) {

        var ps, results, output, affected;

        return this.pool.then(pool => {
                ps = new mysql.PreparedStatement(pool)
                return Promise.resolve();
            })
            .then(async() => await this.makeParams(ps, sql, inputParams, outputParams))
            .then(sql => ps.prepare(sql))
            .then(() => ps.execute(Object.assign(inputParams, outputParams || {})))
            .then(result => {
                results = result.recordsets;
                output = result.output;
                affected = result.rowsAffected.reduce((total, v) => total + v, 0);
                if (callback) {
                    setImmediate(() => {
                        callback(null, results, Object.keys(output).length == 0 ? affected : output);
                    })
                }
                return ps.unprepare();
            })
            .then(() => {
                if (results.length == 0) {
                    return Promise.resolve(Object.keys(output).length == 0 ? affected : output)
                }
                if (results.length == 1) {
                    return Promise.resolve(results[0])
                }
                return Promise.resolve(results)
            })
            .catch(e => {
                ps && ps.unprepare(err => {})
                console.error(e, 'mysql-helper proc')
                throw e;
            });
    };

}

module.exports = MYSQLHelper;