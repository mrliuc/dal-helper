'use strict';

var MSSQLHelper = require('./db/mssql-helper');

class doAction {
    constructor(mssql, sql, param) {
        this.mssql = mssql;
        this.sql = sql;
        this.param = param;
    }

    async exec(callback, isDebug) {
        if (isDebug) {
            console.log(this.sql);
            console.log(this.param);
        }
        return this.mssql.exec(this.sql, this.param, callback);

    }
}

class MSSQLDalHelper {
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

        if (!this.mssql) {
            this.mssql = new MSSQLHelper(config);
            Object.assign(this, this.mssql);
        }
        // this.query = () => this.mssql.query;
        // this.proc = () => this.mssql.proc;
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
                            whereAnds.push(' ' + table + '[' + columnName + '] ' + op + ' @' + pKey);
                            param[pKey] = val[0];
                        } else {
                            whereAnds.push(' ' + table + '[' + columnName + '] in (@' + pKey + ') ');
                            param[pKey] = val;
                        }
                    } else {

                        if (columnName.indexOf('@') === 0) {
                            whereAnds.push(' ' + table + '[' + columnName.replace(/@/g, '') + '] ' + op + ' ' + val);
                        } else {
                            if (val === null) {
                                whereAnds.push(' ' + table + '[' + columnName + '] is null ');
                            } else {
                                whereAnds.push(' ' + table + '[' + columnName + '] ' + op + ' @' + pKey + ' ');
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
                            whereAnds.push(' ' + table + '[' + columnName + ']=@' + pKey);
                            param[pKey] = whereAnd[key][0];
                        } else {
                            whereAnds.push(' ' + table + '[' + columnName + '] in (@' + pKey + ') ');
                            param[pKey] = whereAnd[key];
                        }
                    } else {

                        if (columnName.indexOf('@') === 0) {
                            whereAnds.push(' ' + table + '[' + columnName.replace(/@/g, '') + ']=' + whereAnd[key]);
                        } else {
                            if (whereAnd[key] == null) {
                                whereAnds.push(' ' + table + '[' + columnName + '] is null ');
                            } else {
                                whereAnds.push(' ' + table + '[' + columnName + ']=@' + pKey + ' ');
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
                            whereOrs.push(' ' + table + '[' + columnName + '] ' + op + ' @' + pKey);
                            param[pKey] = val[0];
                        } else {
                            whereOrs.push(' ' + table + '[' + columnName + '] in (@' + pKey + ') ');
                            param[pKey] = val;
                        }
                    } else {

                        if (columnName.indexOf('@') === 0) {
                            whereOrs.push(' ' + table + '[' + columnName.replace(/@/g, '') + '] ' + op + ' ' + val);
                        } else {
                            if (val === null) {
                                whereOrs.push(' ' + table + '[' + columnName + '] is null ');
                            } else {
                                whereOrs.push(' ' + table + '[' + columnName + '] ' + op + ' @' + pKey + ' ');
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
                            whereOrs.push(' ' + table + '[' + columnName + ']=@' + pKey);
                            param[pKey] = whereOr[key][0];
                        } else {
                            whereOrs.push(' ' + table + '[' + columnName + '] in (@' + pKey + ')');
                            param[pKey] = whereOr[key];
                        }
                    } else {
                        if (columnName.indexOf('@') === 0) {
                            whereOrs.push(' ' + table + '[' + columnName.replace(/@/g, '') + ']=' + whereOr[key]);
                        } else {

                            if (whereOr[key] == null) {
                                whereOrs.push(' ' + table + '[' + columnName + '] is null ');
                            } else {
                                whereOrs.push(' ' + table + '[' + columnName + ']=@' + pKey);
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
        sql += '[' + option.table + '] set ';

        let columnNames = [];

        if (option.data instanceof Array) {
            option.data.forEach(function(item) {
                var key = item[0];
                var val = item[1];
                var op = item.length > 2 ? item[2] : '=';

                if (key.indexOf('@') === 0) {
                    columnNames.push(key.replace(/@/g, '') + op + val);
                } else {
                    columnNames.push(key + op + '@' + key + index);
                    param[key + index] = val;
                }

            });
        } else {
            Object.keys(option.data).forEach(function(key) {

                if (key.indexOf('@') === 0) {
                    columnNames.push(key.replace(/@/g, '') + '=' + option.data[key]);
                } else {
                    columnNames.push(key + '=@' + key + index);
                    param[key + index] = option.data[key];
                }

            });
        }
        sql += columnNames.join(',');

        return sql;
    }

    getInsertSql(option, param, index) {
        var sql = ' insert ';
        sql += '[' + option.table + ']';

        let columnNames = [];
        let valueNames = [];

        Object.keys(option.data).forEach(function(key) {
            columnNames.push(key.replace(/@/g, ''));
            if (key.indexOf('@') === 0) {
                valueNames.push(option.data[key]);
            } else {
                valueNames.push('@' + key + index);
                param[key + index] = option.data[key];
            }
        });

        sql += '([' + columnNames.join('],[') + '])';

        sql += ' values(' + valueNames.join(',') + ');';

        if (option.identity) {
            if (sql.indexOf(' declare @' + option.table + '_Id') >= 0) {
                sql += ' set  @' + option.table + '_Id =@@IDENTITY; select @' + option.table + '_Id as Id;';
            } else {
                sql += ' declare @' + option.table + '_Id int=@@IDENTITY; select @' + option.table + '_Id as Id;';
            }
        }

        return sql;
    }

    dmls(options) {
        var sql = '';
        var param = {};

        options.forEach((option, index) => {
            switch (option.DMLType) {
                case this.DMLType.SELECT:
                    {
                        sql += ' select ';

                        if (option.top) {
                            sql += ' top ' + option.top + ' ';
                        }

                        let columnNames = [];

                        if (option.groupColumns && option.groupColumns.length > 0) {
                            columnNames = columnNames.concat(option.groupColumns);
                        }

                        if (option.columns && option.columns.length > 0) {
                            option.columns.forEach(function(column) {
                                columnNames.push('[' + column + ']');
                            });
                        }

                        if (columnNames.length > 0) {
                            sql += columnNames.join(',');
                        } else {
                            sql += option.table + '.*';
                        }

                        var from = ' from [' + option.table + '] with(nolock) ';

                        if (option.join) {
                            from += ' join [' + option.join.table + '] with(nolock) ';
                            from += ' on ' + option.join.on + ' ';
                        }

                        sql += from;

                        let wheres = this.formatWheres(option, param, index);

                        if (wheres.length > 0) {
                            sql += ' where ' + wheres.join(' and ');
                        }

                        if (option.orderBys && option.orderBys.length > 0) {
                            sql += ' order by [' + option.orderBys.join('],[') + ']';
                        }

                        if (option.orderByDescs && option.orderByDescs.length > 0) {
                            sql += ' order by [' + option.orderByDescs.join('],[') + '] desc';
                        }

                        if (option.groupBys && option.groupBys.length > 0) {
                            sql += ' group by [' + option.groupBys.join('],[') + ']';
                        }

                        if (option.page) {
                            sql += ' offset @pageStart rows fetch next @pageLength rows only';
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
                case this.DMLType.INSERT:
                    {
                        sql += ' insert ';
                        sql += '[' + option.table + ']';

                        let columnNames = [];
                        let valueNames = [];

                        Object.keys(option.data).forEach(function(key) {
                            columnNames.push(key.replace(/@/g, ''));
                            if (key.indexOf('@') === 0) {
                                valueNames.push(option.data[key]);
                            } else {
                                valueNames.push('@' + key + index);
                                param[key + index] = option.data[key];
                            }
                        });

                        sql += '([' + columnNames.join('],[') + '])';

                        sql += ' values(' + valueNames.join(',') + ');';

                        if (option.identity) {
                            if (sql.indexOf(' declare @' + option.table + '_Id') >= 0) {
                                sql += ' set  @' + option.table + '_Id =@@IDENTITY; select @' + option.table + '_Id as Id;';
                            } else {
                                sql += ' declare @' + option.table + '_Id int=@@IDENTITY; select @' + option.table + '_Id as Id;';
                            }
                        }
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
                        sql += ' delete ';
                        sql += '[' + option.table + '] ';

                        let wheres = this.formatWheres(option, param, index);

                        if (wheres.length > 0) {
                            sql += ' where ' + wheres.join(' and ');
                        }
                        sql += ';';
                    }
                    break;

                case this.DMLType.UPDATE_INSERT:
                    {
                        let wheres = this.formatWheres(option, param, index);

                        sql += ' if exists(select 1 from [' + option.table + '] ';

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
                        sql += ' select count(1) Count from [' + option.table + '] with(nolock)';

                        let wheres = this.formatWheres(option, param, index);

                        if (wheres.length > 0) {
                            sql += ' where ' + wheres.join(' and ');
                        }

                        sql += ';';
                    }
            }

            if (option.affected !== undefined) {
                sql += "if (@@ROWCOUNT!=" + option.affected + ") begin declare @errMsg" + index + " nvarchar(100)='table:" + option.table + ",index:" + index + ",affected:'+convert(varchar(10),@@ROWCOUNT)+',affected err';" +
                    "throw 50001,@errMsg" + index + ",1 end;";
            }

        });
        // console.log(sql);
        //console.log(param);
        return new doAction(this.mssql, sql, param);
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
        return new doAction(this.mssql, option.sql, option.param);
    };

}

module.exports = MSSQLDalHelper;