'use strict';

var MYSQLHelper = require('./db/mysql-helper');

class doAction {
    constructor(mysql, options) {
        this.mysql = mysql;
        this.options = options;
    }

    async exec(callback, isDebug) {
        if (isDebug) {
            console.log(this.options);
        }
        return this.mysql.exec(this.options, callback);

    }
}

class MYSQLDalHelper {
    constructor() {
        this.DMLType = {
            INSERT: 1,
            UPDATE: 2,
            DELETE: 3,
            SELECT: 4,
            UPDATE_INSERT: 5,
            COUNT: 6
        }
    }

    setConfig(config) {

        if (!this.mysql) {
            this.mysql = new MYSQLHelper(config);
            Object.assign(this, this.mysql);
        }
        // this.query = () => this.mysql.query;
        // this.proc = () => this.mysql.proc;
        return this;
    }

    getWheres(whereAnd, whereOr, param, index) {
        var whereAnds = [];
        var whereOrs = [];

        index = index === undefined ? '' : index;

        if (whereAnd) {

            if (whereAnd instanceof Array) {
                whereAnd.forEach(function(item, i) {
                    var op = item.length > 2 ? item[2] : '=';
                    var key = item[0];
                    var val = item[1];

                    var table = '',
                        columnName = key;

                    var dot = key.indexOf('.');
                    if (dot > 0) {
                        table = key.substr(0, dot + 1);
                        columnName = key.substr(dot + 1, key.length - dot);
                    }

                    var pKey = 'wa_' + columnName + index + i + '_End';

                    if (val instanceof Array) {
                        if (val.length === 1) {
                            whereAnds.push(' ' + table + columnName + op + ' :' + pKey);
                            param[pKey] = val[0];
                        } else {
                            whereAnds.push(' ' + table + columnName + ' in (:' + pKey + ') ');
                            param[pKey] = val;
                        }
                    } else {

                        if (columnName.indexOf('@') === 0) {
                            whereAnds.push(' ' + table + columnName.replace(/@/g, '') + op + ' ' + val.replace('@', ':'));
                        } else {
                            if (val === null) {
                                whereAnds.push(' ' + table + columnName + ' is null ');
                            } else {
                                whereAnds.push(' ' + table + columnName + op + ' :' + pKey + ' ');
                                param[pKey] = val;
                            }
                        }
                    }

                });
            } else {
                Object.keys(whereAnd).forEach(function(key, i) {

                    var table = '',
                        columnName = key;
                    var dot = key.indexOf('.');
                    if (dot > 0) {
                        table = key.substr(0, dot + 1);
                        columnName = key.substr(dot + 1, key.length - dot);
                    }

                    var pKey = 'wa_' + columnName + index + i + '_End';

                    if (whereAnd[key] instanceof Array) {
                        if (whereAnd[key].length === 1) {
                            whereAnds.push(' ' + table + columnName + '=:' + pKey);
                            param[pKey] = whereAnd[key][0];
                        } else {
                            whereAnds.push(' ' + table + columnName + ' in (:' + pKey + ') ');
                            param[pKey] = whereAnd[key];
                        }
                    } else {

                        if (columnName.indexOf('@') === 0) {
                            whereAnds.push(' ' + table + columnName.replace(/@/g, '') + '=' + whereAnd[key].replace('@', ':'));
                        } else {
                            if (whereAnd[key] == null) {
                                whereAnds.push(' ' + table + columnName + ' is null ');
                            } else {
                                whereAnds.push(' ' + table + columnName + '=:' + pKey + ' ');
                                param[pKey] = whereAnd[key];
                            }

                        }
                    }
                });

            }
        }

        if (whereOr) {
            if (whereOr instanceof Array) {
                whereOr.forEach(function(item, i) {
                    var op = item.length > 2 ? item[2] : '=';
                    var key = item[0];
                    var val = item[1];

                    var table = '',
                        columnName = key;

                    var dot = key.indexOf('.');
                    if (dot > 0) {
                        table = key.substr(0, dot + 1);
                        columnName = key.substr(dot + 1, key.length - dot);
                    }

                    var pKey = 'wo_' + columnName + index + i + '_End';

                    if (val instanceof Array) {
                        if (val.length === 1) {
                            whereOrs.push(' ' + table + columnName + op + ' :' + pKey);
                            param[pKey] = val[0];
                        } else {
                            whereOrs.push(' ' + table + columnName + ' in (:' + pKey + ') ');
                            param[pKey] = val;
                        }
                    } else {

                        if (columnName.indexOf('@') === 0) {
                            whereOrs.push(' ' + table + columnName.replace(/@/g, '') + op + ' ' + val.replace('@', ':'));
                        } else {
                            if (val === null) {
                                whereOrs.push(' ' + table + columnName + ' is null ');
                            } else {
                                whereOrs.push(' ' + table + columnName + op + ' :' + pKey + ' ');
                                param[pKey] = val;
                            }
                        }
                    }

                });
            } else {
                Object.keys(whereOr).forEach(function(key, i) {
                    var table = '',
                        columnName = key;

                    var dot = key.indexOf('.');
                    if (dot > 0) {
                        table = key.substr(0, dot + 1);
                        columnName = key.substr(dot + 1, key.length - dot);
                    }
                    var pKey = 'wo_' + columnName + index + i + '_End';

                    if (whereOr[key] instanceof Array) {
                        if (whereOr[key].length === 1) {
                            whereOrs.push(' ' + table + columnName + '=:' + pKey);
                            param[pKey] = whereOr[key][0];
                        } else {
                            whereOrs.push(' ' + table + columnName + ' in (:' + pKey + ')');
                            param[pKey] = whereOr[key];
                        }
                    } else {
                        if (columnName.indexOf('@') === 0) {
                            whereOrs.push(' ' + table + columnName.replace(/@/g, '') + '=' + whereOr[key].replace('@', ':'));
                        } else {

                            if (whereOr[key] == null) {
                                whereOrs.push(' ' + table + columnName + ' is null ');
                            } else {
                                whereOrs.push(' ' + table + columnName + '=:' + pKey);
                                param[pKey] = whereOr[key];
                            }
                        }
                    }
                });
            }

        }
        var wheres = [];

        if (whereAnds.length > 0) {
            wheres.push('(' + whereAnds.join(' and ') + ')');
        }

        if (whereOrs.length > 0) {
            wheres.push('(' + whereOrs.join(' or ') + ')');
        }

        return wheres;
    };

    getUpdateSql(option, param, index) {
        var sql = ' update ';
        sql += option.table + ' set ';

        let columnNames = [];

        if (option.data instanceof Array) {
            option.data.forEach(function(item) {
                var key = item[0];
                var val = item[1];
                var op = item.length > 2 ? item[2] : '=';

                if (key.indexOf('@') === 0) {
                    columnNames.push(key.replace(/@/g, '') + op + val.replace('@', ':'));
                } else {
                    columnNames.push(key + op + ':' + key + index);
                    param[key + index] = val;
                }

            });
        } else {
            Object.keys(option.data).forEach(function(key) {

                if (key.indexOf('@') === 0) {
                    columnNames.push(key.replace(/@/g, '') + '=' + option.data[key].replace('@', ':'));
                } else {
                    columnNames.push(key + '=:' + key + index);
                    param[key + index] = option.data[key];
                }

            });
        }
        sql += columnNames.join(',');

        return sql;
    }

    getInsertSql(option, param, index) {
        var sql = ' insert ';
        sql += option.table;

        let columnNames = [];
        let valueNames = [];

        Object.keys(option.data).forEach(function(key) {
            columnNames.push(key.replace(/@/g, ''));
            if (key.indexOf('@') === 0) {
                valueNames.push(option.data[key].replace('@', ':'));
            } else {
                valueNames.push(':' + key + index);
                param[key + index] = option.data[key];
            }
        });

        sql += '(' + columnNames.join(',') + ')';

        sql += ' values(' + valueNames.join(',') + ');';

        return sql;
    }

    dmls(options) {
        options.forEach((option, index) => {
            let sql = '';
            let param = {};
            switch (option.DMLType) {
                case this.DMLType.INSERT:
                    {
                        sql += ' insert ';
                        sql += '' + option.table + '';

                        let columnNames = [];
                        let valueNames = [];

                        Object.keys(option.data).forEach(function(key) {
                            columnNames.push(key.replace(/@/g, ''));
                            if (key.indexOf('@') === 0) {
                                valueNames.push(option.data[key].replace('@', ':'));
                            } else {
                                valueNames.push(':' + key + index);
                                param[key + index] = option.data[key];
                            }
                        });

                        sql += '(' + columnNames.join(',') + ')';
                        sql += ' values(' + valueNames.join(',') + ');';
                    }
                    break;
                case this.DMLType.UPDATE:
                    {
                        sql += this.getUpdateSql(option, param, index);

                        let wheres = this.formatWheres(option, param, index);

                        if (wheres.length > 0) {
                            sql += ' where ' + wheres.join(' and ');
                        }
                        sql += ';';
                    }
                    break;
                case this.DMLType.DELETE:
                    {
                        sql += ' delete from ';
                        sql += option.table;

                        let wheres = this.formatWheres(option, param, index);

                        if (wheres.length > 0) {
                            sql += ' where ' + wheres.join(' and ');
                        }
                        sql += ';';
                    }
                    break;
                case this.DMLType.SELECT:
                    {
                        sql += ' select ';

                        if (option.top) {
                            sql += ' top ' + option.top + ' ';
                        }

                        if (option.columns && option.columns.length > 0) {
                            let columnNames = [];
                            option.columns.forEach(function(column) {
                                columnNames.push(column);
                            });

                            sql += columnNames.join(',');
                        } else {
                            sql += option.table + '.*';
                        }

                        var from = ' from ' + option.table;

                        if (option.join) {
                            from += ' join ' + option.join.table;
                            from += ' on ' + option.join.on + ' ';
                        }

                        sql += from;

                        let wheres = this.formatWheres(option, param, index);

                        if (wheres.length > 0) {
                            sql += ' where ' + wheres.join(' and ');
                        }

                        if (option.orderBys && option.orderBys.length > 0) {
                            sql += ' order by ' + option.orderBys.join(',') + '';
                        }

                        if (option.orderByDescs && option.orderByDescs.length > 0) {
                            sql += ' order by ' + option.orderByDescs.join(',') + '] desc';
                        }

                        if (option.page) {
                            sql += ' offset :pageStart rows fetch next :pageLength rows only';
                            param['pageStart'] = option.page.start;
                            param['pageLength'] = option.page.length;

                            sql += ';';
                            sql += ' select count(1) Total';
                            sql += from;
                            if (wheres.length > 0) {
                                sql += ' where ' + wheres.join(' and ');
                            }
                        }
                        sql += ';';
                    }
                    break;
                case this.DMLType.UPDATE_INSERT:
                    {
                        let wheres = this.formatWheres(option, param, index);

                        sql += ' if exists(select 1 from ' + option.table;

                        if (wheres.length > 0) {
                            sql += ' where ' + wheres.join(' and ');
                        }

                        sql += ' )';
                        sql += 'begin ';

                        sql += this.getUpdateSql(option, param, index);


                        if (wheres.length > 0) {
                            sql += ' where ' + wheres.join(' and ');
                        }

                        sql += ' end ';
                        sql += 'else begin ';

                        sql += this.getInsertSql(option, param, index);

                        sql += 'end ';

                    }
                    break;
                case this.DMLType.COUNT:
                    {
                        sql += ' select count(1) Count from ' + option.table;

                        let wheres = this.formatWheres(option, param, index);

                        if (wheres.length > 0) {
                            sql += ' where ' + wheres.join(' and ');
                        }

                        sql += ';';
                    }
            }

            option.sql = sql;
            option.param = param;

        });
        // console.log(sql);
        //console.log(param);
        return new doAction(this.mysql, options);
    };

    formatWheres(option, param, index) {

        let wheres = this.getWheres(option.whereAnd, option.whereOr, param, index);

        if (option.whereOrs) {
            option.whereOrs.forEach((whereOr, i) => {
                wheres = wheres.concat(this.getWheres(null, whereOr, param, index + '_' + i));
            })
        }
        return wheres;
    }


    select(option) {
        option.DMLType = this.DMLType.SELECT;
        return this.dmls([option]);
        //console.log(param);

    };

    //var option = {
    //    data: {Id:1, Name:'sdaf'},
    //    table: 'Test'
    //};

    insert(option) {
        option.DMLType = this.DMLType.INSERT;
        return this.dmls([option]);
    };

    //var option = {
    //    data: {Id:1, Name:'sdaf'},
    //    table: 'Test',
    //    whereAnd: {Id:1 },
    //    whereOr: { Id: 1, Name:'1231'}
    //};

    update(option) {
        option.DMLType = this.DMLType.UPDATE;
        return this.dmls([option]);
    };

    updateOrInsert(option) {
        option.DMLType = this.DMLType.UPDATE_INSERT;
        return this.dmls([option]);
    };

    //var option = {
    //    table: 'Test',
    //    whereAnd: {Id:1 },
    //    whereOr: { Id: 1, Name:'1231'}
    //};
    delete(option) {
        option.DMLType = this.DMLType.DELETE;
        return this.dmls([option]);
    };

    count(option) {
        option.DMLType = this.DMLType.COUNT;
        return this.dmls([option]);
    };

    sql(option) {
        return new doAction(this.mysql, option.sql, option.param);
    };

}

module.exports = MYSQLDalHelper;