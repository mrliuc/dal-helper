const mysql = require('mysql');

class Drive {
    constructor(config) {
        this.config = config;

        this.pool = mysql.createPool(config);

        this.query = async (sql, params, callback) => this.proc(sql, params, callback);
        this.proc = async (sql, inputParams, callback) => this._proc(sql, inputParams, callback);
    }

    async exec(options, callback) {
        const results = [];
        let affected = 0;

        let connection;

        try {
            connection = await new Promise((resolve, reject) => {
                this.pool.getConnection((err, conn) => {
                    if (err) { return reject(err); }
                    return resolve(conn);
                });
            });

            await new Promise((resolve, reject) => {
                connection.beginTransaction((err) => {
                    if (err) { return reject(err); }
                    resolve();
                });
            });

            const identityParam = {};
            for (const option of options) {
                const result = await Drive._query(connection, option.sql, Object.assign(option.param || {}, identityParam));

                if (result instanceof Array) {
                    results.push(result);
                }

                if (result.affectedRows) {
                    affected += result.affectedRows;
                }

                if (result.insertId > 0) {
                    identityParam[`${option.table}_Id`] = result.insertId;
                }

                if (option.identity) {
                    results.push([{ Id: result.insertId }]);
                }

                if (option.affected && result.affectedRows !== option.affected) {
                    throw new Error(JSON.stringify(['affected error', result, option]));
                }
            }

            return new Promise((resolve, reject) => {
                connection.commit((err) => {
                    if (err) { return reject(err); }
                    if (callback) {
                        setImmediate(() => {
                            callback(null, results, affected);
                        });
                    }

                    if (results.length === 0) {
                        return resolve(affected);
                    }
                    if (results.length === 1) {
                        return resolve(results[0]);
                    }
                    return resolve(results);
                });
            });
        } catch (err) {
            console.error(err, options);
            if (connection) {
                console.log(1123);
                await new Promise((resolve) => {
                    connection.rollback((e) => {
                        if (e) { console.error(e); }
                        resolve();
                    });
                });
            }
            throw err;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    static _queryFormat(connection) {
        return (query, values) => {
            if (!values) return query;
            const sql = query.replace(/:(\w+)/g, (txt, key) => {
                if (Object.prototype.hasOwnProperty.call(values, key)) {
                    return connection.escape(values[key]);
                }
                return txt;
            });
            // console.log(sql);
            return sql;
        };
    }

    static async _query(connection, sql, param) {
        return new Promise((resolve, reject) => {
            if (!connection.config.queryFormat) {
                // eslint-disable-next-line no-param-reassign
                connection.config.queryFormat = Drive._queryFormat(connection);
            }

            connection.query(sql, param, (err, res) => {
                if (err) { return reject(err); }
                // console.log(err, res)
                return resolve(res);
            });
        });
    }

    async _proc(sql, inputParams, callback) {
        let connection;

        try {
            connection = await new Promise((resolve, reject) => {
                this.pool.getConnection((err, conn) => {
                    if (err) { return reject(err); }
                    return resolve(conn);
                });
            });

            const sqlResult = await Drive._query(connection, sql, inputParams);
            const results = sqlResult[0];

            if (callback) {
                setImmediate(() => {
                    callback(null, results);
                });
            }

            if (results.length === 1) {
                return Promise.resolve(results[0]);
            }

            return Promise.resolve(results);
        } catch (e) {
            console.error(e, sql, inputParams, 'mysql-helper exec');
            if (connection) {
                await new Promise((resolve) => {
                    connection.rollback((err) => {
                        if (err) { console.error(err); }
                        resolve();
                    });
                });
            }
            throw e;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
}

module.exports = Drive;
