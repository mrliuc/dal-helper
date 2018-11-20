'use strict';

var mssql = require('./db/mssql-helper');

var dal = {};

Object.assign(dal, mssql);

// dal.setConfig = mssql.setConfig;


function doAction(sql, param) {
    this.sql = sql;
    this.param = param;
    this.exec = function(callback) {
        // console.log(sql);
        //console.log(param);
        mssql.exec(sql, param, callback);
    }

};

function getWheres(whereAnd, whereOr, param, index) {
    var whereAnds = [];
    var whereOrs = [];

    index = index === undefined ? '' : index;

    if (whereAnd) {

        if (whereAnd instanceof Array) {
            whereAnd.forEach(function(item, i) {
                var op = item.length > 2 ? item[2] : '=';
                var name = item[0];
                var val = item[1];

                var pKey = 'wa_' + name + index + i + '_End';

                if (val instanceof Array) {
                    if (val.length === 1) {
                        whereAnds.push(' [' + name + '] ' + op + ' @' + pKey);
                        param[pKey] = val[0];
                    } else {
                        whereAnds.push(' [' + name + '] in (@' + pKey + ') ');
                        param[pKey] = val;
                    }
                } else {

                    if (name.indexOf('@') === 0) {
                        whereAnds.push(' [' + name.replace(/@/g, '') + '] ' + op + ' ' + val);
                    } else {
                        if (val === null) {
                            whereAnds.push(' [' + name + '] ' + op + ' null ');
                        } else {
                            whereAnds.push(' [' + name + '] ' + op + ' @' + pKey + ' ');
                            param[pKey] = val;
                        }
                    }
                }

            });
        } else {
            Object.keys(whereAnd).forEach(function(key, i) {
                var pKey = 'wa_' + key + index + i + '_End';

                if (whereAnd[key] instanceof Array) {
                    if (whereAnd[key].length === 1) {
                        whereAnds.push(' [' + key + ']=@' + pKey);
                        param[pKey] = whereAnd[key][0];
                    } else {
                        whereAnds.push(' [' + key + '] in (@' + pKey + ') ');
                        param[pKey] = whereAnd[key];
                    }
                } else {

                    if (key.indexOf('@') === 0) {
                        whereAnds.push(' [' + key.replace(/@/g, '') + ']=' + whereAnd[key]);
                    } else {
                        whereAnds.push(' [' + key + ']=@' + pKey + ' ');
                        param[pKey] = whereAnd[key];
                    }
                }
            });

        }
    }

    if (whereOr) {
        if (whereOr instanceof Array) {
            whereOr.forEach(function(item, i) {
                var op = item.length > 2 ? item[2] : '=';
                var name = item[0];
                var val = item[1];

                var pKey = 'wo_' + name + index + i + '_End';

                if (val instanceof Array) {
                    if (val.length === 1) {
                        whereOrs.push(' [' + name + '] ' + op + ' @' + pKey);
                        param[pKey] = val[0];
                    } else {
                        whereOrs.push(' [' + name + '] in (@' + pKey + ') ');
                        param[pKey] = val;
                    }
                } else {

                    if (name.indexOf('@') === 0) {
                        whereOrs.push(' [' + name.replace(/@/g, '') + '] ' + op + ' ' + val);
                    } else {
                        whereOrs.push(' [' + name + '] ' + op + ' @' + pKey + ' ');
                        param[pKey] = val;
                    }
                }

            });
        } else {
            Object.keys(whereOr).forEach(function(key, i) {

                var pKey = 'wo_' + key + index + i + '_End';

                if (whereOr[key] instanceof Array) {
                    if (whereOr[key].length === 1) {
                        whereOrs.push(' [' + key + ']=@' + pKey);
                        param[pKey] = whereOr[key][0];
                    } else {
                        whereOrs.push(' [' + key + '] in (@' + pKey + ')');
                        param[pKey] = whereOr[key];
                    }
                } else {
                    if (key.indexOf('@') === 0) {
                        whereOrs.push(' [' + key.replace(/@/g, '') + ']=' + whereOr[key]);
                    } else {
                        whereOrs.push(' [' + key + ']=@' + pKey);
                        param[pKey] = whereOr[key];
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

function getUpdateSql(option, param, index) {
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

function getInsertSql(option, param, index) {
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

var DMLType = {
    INSERT: 1,
    UPDATE: 2,
    DELETE: 3,
    SELECT: 4,
    UPDATE_INSERT: 5,
    COUNT: 6

};

//var CONDType = {
//    EQUAL: 1,
//    GREATER: 2,
//    GREATEREQUAL: 3,
//    LESS: 4,
//    LESSEQUAL: 5,
//    UNEQUAL: 6,
//    LIKE: 7
//};

dal.DMLType = DMLType;
//dal.CONDType = CONDType;

function dmls(options) {
    var sql = '';
    var param = {};

    options.forEach(function(option, index) {
        switch (option.DMLType) {
            case DMLType.INSERT:
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
            case DMLType.UPDATE:
                {
                    sql += getUpdateSql(option, param, index);

                    let wheres = getWheres(option.whereAnd, option.whereOr, param, index);

                    if (wheres.length > 0) {
                        sql += ' where ' + wheres.join(' and ');
                    }
                    sql += ';';
                }
                break;
            case DMLType.DELETE:
                {
                    sql += ' delete ';
                    sql += '[' + option.table + '] ';

                    let wheres = getWheres(option.whereAnd, option.whereOr, param, index);

                    if (wheres.length > 0) {
                        sql += ' where ' + wheres.join(' and ');
                    }
                    sql += ';';
                }
                break;
            case DMLType.SELECT:
                {
                    sql += ' select ';

                    if (option.top) {
                        sql += ' top ' + option.top + ' ';
                    }

                    if (option.columns && option.columns.length > 0) {
                        let columnNames = [];
                        option.columns.forEach(function(column) {
                            columnNames.push('[' + column + ']');
                        });

                        sql += columnNames.join(',');
                    } else {
                        sql += '*';
                    }

                    sql += ' from [' + option.table + '] with(nolock) ';

                    let wheres = getWheres(option.whereAnd, option.whereOr, param, index);

                    if (wheres.length > 0) {
                        sql += ' where ' + wheres.join(' and ');
                    }

                    if (option.orderBys && option.orderBys.length > 0) {
                        sql += ' order by [' + option.orderBys.join('],[') + ']';
                    }

                    if (option.orderByDescs && option.orderByDescs.length > 0) {
                        sql += ' order by [' + option.orderByDescs.join('],[') + '] desc';
                    }

                    if (option.page) {
                        sql += ' offset @pageStart rows fetch next @pageLength rows only';
                        param['pageStart'] = option.page.start;
                        param['pageLength'] = option.page.length;

                        sql += ';';
                        sql += ' select count(1) Total';
                        sql += ' from [' + option.table + '] with(nolock) ';
                        if (wheres.length > 0) {
                            sql += ' where ' + wheres.join(' and ');
                        }
                    }
                    sql += ';';
                }
                break;
            case DMLType.UPDATE_INSERT:
                {
                    let wheres = getWheres(option.whereAnd, option.whereOr, param, index);

                    sql += ' if exists(select 1 from [' + option.table + '] ';

                    if (wheres.length > 0) {
                        sql += ' where ' + wheres.join(' and ');
                    }

                    sql += ' )';
                    sql += 'begin ';

                    sql += getUpdateSql(option, param, index);


                    if (wheres.length > 0) {
                        sql += ' where ' + wheres.join(' and ');
                    }

                    sql += ' end ';
                    sql += 'else begin ';

                    sql += getInsertSql(option, param, index);

                    sql += 'end ';

                }
                break;
            case DMLType.COUNT:
                {
                    sql += ' select count(1) Count from [' + option.table + '] with(nolock)';

                    let wheres = getWheres(option.whereAnd, option.whereOr, param, index);

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
    return new doAction(sql, param);
};


dal.select = function(option) {
    option.DMLType = DMLType.SELECT;
    return dmls([option]);
    //console.log(param);

};

//var option = {
//    data: {Id:1, Name:'sdaf'},
//    table: 'Test'
//};

dal.insert = function(option) {
    option.DMLType = DMLType.INSERT;
    return dmls([option]);
};

//var option = {
//    data: {Id:1, Name:'sdaf'},
//    table: 'Test',
//    whereAnd: {Id:1 },
//    whereOr: { Id: 1, Name:'1231'}
//};

dal.update = function(option) {
    option.DMLType = DMLType.UPDATE;
    return dmls([option]);
};

dal.updateOrInsert = function(option) {
    option.DMLType = DMLType.UPDATE_INSERT;
    return dmls([option]);
};


//var option = {
//    table: 'Test',
//    whereAnd: {Id:1 },
//    whereOr: { Id: 1, Name:'1231'}
//};
dal.delete = function(option) {
    option.DMLType = DMLType.DELETE;
    return dmls([option]);
};

dal.count = function(option) {
    option.DMLType = DMLType.COUNT;
    return dmls([option]);
};

dal.sql = function(option) {
    return new doAction(option.sql, option.param);
};

dal.dmls = dmls;

module.exports = dal;