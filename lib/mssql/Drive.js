
const mssql = require('mssql');
const util = require('util');

class Drive {
    constructor(config) {
        this.config = config;
        this.pool = new mssql.ConnectionPool(config).connect();

        this.query = async (sql, params, callback) => this._proc(sql, params, null, callback);
        this.proc = async (sql, inputParams, outputParams, callback) => this._proc(sql, inputParams, outputParams, callback);
    }

    static async makeParams(ps, sql, inputParams, outputParams) {
        let originSql = sql;
        if (inputParams) {
            for (const key in inputParams) {
                if (!Object.prototype.hasOwnProperty.call(inputParams, key)) {
                    continue;
                }
                // console.log(key);
                // console.log(typeof inputParams[key]);
                switch (typeof inputParams[key]) {
                case 'string':
                    if (inputParams[key].length > 2000) {
                        ps.input(key, mssql.NText, inputParams[key]);
                    } else {
                        ps.input(key, mssql.NVarChar(inputParams[key].length + 50), inputParams[key]);
                    }
                    // console.log( params[key]);

                    break;
                case 'number':
                    if (/^-?\d+$/.test(inputParams[key])) {
                        ps.input(key, mssql.Int, inputParams[key]);
                    } else if (/^(-?\d+)\.\d{1,2}$/.test(inputParams[key])) {
                        ps.input(key, mssql.Decimal(18, 2), inputParams[key]);
                    } else {
                        ps.input(key, mssql.Float, inputParams[key]);
                    }
                    // console.log( params[key]);

                    break;
                case 'object':

                    if (util.isDate(inputParams[key])) {
                        // ps.input(key, mssql.NVarChar(50), moment(inputParams[key]).format('YYYY-MM-DD HH:MM:ss.SSS'));

                        // var date = inputParams[key];
                        // console.log(date);
                        // date.setHours(date.getHours() + 8);
                        ps.input(key, mssql.DateTime, inputParams[key]);
                    } else if (inputParams[key] === null) {
                        ps.input(key, mssql.NVarChar(50), inputParams[key]);
                    } else if (inputParams[key] instanceof Array) {
                        const reg = new RegExp(`@${key}`, 'g');
                        switch (typeof inputParams[key][0]) {
                        case 'string':
                            originSql = originSql.replace(reg, `'${inputParams[key].join('\',\'')}'`);
                            break;
                        case 'number':
                            originSql = originSql.replace(reg, inputParams[key].join(','));
                            break;
                        default:
                            return Promise.reject(new Error(`sql参数异常:${key}:${JSON.stringify(inputParams[key])}    SQL:${originSql}`));
                        }

                        // const tvp = new mssql.Table();
                        // switch (typeof inputParams[key][0]) {
                        // case 'string':
                        //     tvp.columns.add('COL', mssql.VarChar(50));
                        //     break;
                        // case 'number':
                        //     tvp.columns.add('COL', mssql.Int);
                        //     break;
                        // default:
                        //     return Promise.reject(new Error(`sql参数异常:${key}:${JSON.stringify(inputParams[key])}    SQL:${originSql}`));
                        // }

                        // for (const v of inputParams[key]) {
                        //     tvp.rows.add(v);
                        // }

                        // const reg = new RegExp(`@${key}`, 'g');
                        // originSql = originSql.replace(reg, `select COL from @${key}`);
                        // console.log('11111111111111111111', originSql);
                        // ps.input(key, mssql.TVP, tvp);

                        // ps.input(key, mssql.NVarChar(50), inputParams[key]);
                        // const paramName = `@${key}`;
                        // const tableName = `@t_${key}`;
                        // let tempSql = '';
                        // switch (typeof inputParams[key][0]) {
                        // case 'string':
                        //     tempSql = `declare ${tableName} table(v nvarchar(50));insert into ${tableName} select v from [fn_Split](${paramName},',');`;
                        //     break;
                        // case 'number':
                        //     if (/^-?\d+$/.test(inputParams[key])) {
                        //         tempSql = ` declare ${tableName} table(v int);insert into ${tableName} select convert(int,v) v from [fn_Split](${paramName},',');`;
                        //     } else if (/^(-?\d+)\.\d{1,2}$/.test(inputParams[key])) {
                        //         tempSql = ` declare ${tableName} table(v decimal(18,2));insert into ${tableName} select convert(decimal(18,2),v) v from [fn_Split](${paramName},',');`;
                        //     } else {
                        //         tempSql = ` declare ${tableName} table(v float);insert into ${tableName} select convert(float,v) v from [fn_Split](${paramName},',');`;
                        //     }
                        //     break;

                        // default:
                        //     return Promise.reject(new Error(`sql参数异常:${key}:${JSON.stringify(inputParams[key])}    SQL:${originSql}`));
                        // }
                        // const reg = new RegExp(`@${key}`, 'g');
                        // originSql = tempSql + originSql.replace(reg, `select v from ${tableName}`);

                        // const paramStr = inputParams[key].join(',');

                        // // if (paramStr.length > 2000) {
                        // //     throw 'sql参数过长：' + paramStr;
                        // // }

                        // ps.input(key, mssql.NVarChar(mssql.MAX), paramStr);
                    }

                    break;
                default:
                    ps.input(key, mssql.NVarChar(50), null);
                }
            }


            // console.log(inputParams);
            // console.log(originSql);
        }

        if (outputParams) {
            for (const key in outputParams) {
                if (!Object.prototype.hasOwnProperty.call(outputParams, key)) {
                    continue;
                }
                switch (typeof outputParams[key]) {
                case 'string':
                    ps.output(key, mssql.NVarChar(50));
                    break;
                case 'number':
                    if (/^(-?\d+)\.\d+$/.test(outputParams[key])) {
                        ps.output(key, mssql.Decimal(18, 2));
                    } else {
                        ps.output(key, mssql.Int);
                    }
                    break;
                case 'object':

                    if (util.isDate(outputParams[key])) {
                        ps.output(key, mssql.DateTime);
                    } else if (outputParams[key] === null) {
                        ps.output(key, mssql.NVarChar(50));
                    }
                    break;
                default:
                    return Promise.reject(new Error(`sql参数异常:${key}:${JSON.stringify(outputParams[key])}    SQL:${originSql}`));
                }
            }
        }

        return originSql;
    }

    async exec(sql, params, callback) {
        let transaction;
        let ps;
        try {
            const con = await this.pool;
            transaction = new mssql.Transaction(con);
            ps = new mssql.PreparedStatement(transaction);
            const originSql = await Drive.makeParams(ps, sql, params, null);
            await transaction.begin(mssql.ISOLATION_LEVEL.READ_COMMITTED);
            await ps.prepare(originSql);
            const sqlResult = await ps.execute(params);

            const results = sqlResult.recordsets;
            const affected = sqlResult.rowsAffected.reduce((total, v) => total + v, 0);

            await ps.unprepare();
            await transaction.commit();

            if (callback) {
                setImmediate(() => {
                    callback(null, results, affected);
                });
            }

            if (results.length === 0) {
                return Promise.resolve(affected);
            }
            if (results.length === 1) {
                return Promise.resolve(results[0]);
            }
            return Promise.resolve(results);
        } catch (e) {
            console.error(e, sql, params, 'mssql-helper exec');
            if (ps) {
                await ps.unprepare();
            }
            if (transaction) {
                await transaction.rollback().catch((err) => console.error(err || 'tran rollback'));
            }

            throw e;
        }
    }

    async _proc(sql, inputParams, outputParams, callback) {
        let ps;
        try {
            const con = await this.pool;
            ps = new mssql.PreparedStatement(con);
            const originSql = await Drive.makeParams(ps, sql, inputParams, outputParams);
            await ps.prepare(originSql);
            const sqlResult = await ps.execute(Object.assign(inputParams, outputParams || {}));

            const results = sqlResult.recordsets;
            const output = sqlResult.output;
            const affected = sqlResult.rowsAffected.reduce((total, v) => total + v, 0);

            await ps.unprepare();

            if (callback) {
                setImmediate(() => {
                    callback(null, results, Object.keys(output).length === 0 ? affected : output);
                });
            }

            if (results.length === 0) {
                return Promise.resolve(Object.keys(output).length === 0 ? affected : output);
            }
            if (results.length === 1) {
                return Promise.resolve(results[0]);
            }
            return Promise.resolve(results);
        } catch (e) {
            console.error(e, sql, inputParams, outputParams, 'mssql-helper exec');
            if (ps) {
                await ps.unprepare();
            }

            throw e;
        }
    }
}

module.exports = Drive;
