﻿/* eslint-disable no-undef */
const assert = require('assert');
const fs = require('fs');
const config = require('./config');
const dalHelper = require('../../index.js')(config);

describe('mssql obj ddl', () => {
    before(async () => {
        const sqls = fs.readFileSync(`${__dirname}/prepare.sql`, 'utf-8');
        // console.log(sql);
        for (const sql of sqls.split('###')) {
            if (!sql) {
                continue;
            }
            const affected = await dalHelper.sql({ sql }).exec(null, false);
            if (affected === 0) {
                // console.error(affected, 'init error');
            }
        }
        return Promise.resolve();
    });

    let currentDateTime = new Date();
    let data = {
        ColInt: 1, ColNvarchar: 'aa', ColDateTime: currentDateTime, ColFloat: 1.123456,
    };
    it('insert', async () => {
        const affected = await dalHelper.insert({
            table: 'TestTable',
            data,
        }).exec();

        assert.equal(affected, 1);

        return Promise.resolve();
    });

    it('select', async () => {
        const [result] = await dalHelper.select({
            table: 'TestTable',
        }).exec();
        assert.deepEqual({ Id: 1, ...data, ...{ ColDateTime: parseInt(data.ColDateTime.getTime() / 1000) } }, { ...result, ...{ ColDateTime: parseInt(data.ColDateTime.getTime() / 1000) } });
        return Promise.resolve();
    });

    it('insert and return indentity', async () => {
        const [result] = await dalHelper.insert({
            table: 'TestTable',
            data,
            identity: true,
        }).exec();

        assert.deepEqual({ Id: 2 }, result);

        return Promise.resolve();
    });

    currentDateTime = new Date();
    data = {
        ColInt: 2, ColNvarchar: 'bb', ColDateTime: currentDateTime, ColFloat: 2.789123,
    };

    it('update', async () => {
        const affected = await dalHelper.update({
            table: 'TestTable',
            data,
            whereAnd: { Id: 2 },
        }).exec();

        assert.equal(affected, 1);

        return Promise.resolve();
    });

    it('select again', async () => {
        const [result] = await dalHelper.select({
            table: 'TestTable',
            whereAnd: { Id: 2 },
        }).exec();
        assert.deepEqual({ Id: 2, ...data, ...{ ColDateTime: parseInt(data.ColDateTime.getTime() / 1000) } }, { ...result, ...{ ColDateTime: parseInt(data.ColDateTime.getTime() / 1000) } });
        return Promise.resolve();
    });


    it('insert tran', async () => {
        const [result] = await dalHelper.dmls([{
            DMLType: dalHelper.DMLType.INSERT,
            table: 'TestTable',
            data,
        }, {
            DMLType: dalHelper.DMLType.INSERT,
            table: 'TestTable',
            data,
            identity: true,
        }, {
            DMLType: dalHelper.DMLType.INSERT,
            table: 'TestTable',
            data: { '@ColInt': '@TestTable_Id' },
        }]).exec();

        assert.deepEqual({ Id: 4 }, result);

        return Promise.resolve();
    });

    it('select count', async () => {
        const [result] = await dalHelper.count({
            table: 'TestTable',
        }).exec();
        assert.equal(5, result.Count);
        return Promise.resolve();
    });

    it('select tran', async () => {
        const [result] = await dalHelper.select({
            table: 'TestTable',
            whereAnd: { Id: 5 },
        }).exec();
        assert.deepEqual(4, result.ColInt);
        return Promise.resolve();
    });

    it('update single', async () => {
        const affected = await dalHelper.dmls([{
            DMLType: dalHelper.DMLType.UPDATE,
            table: 'TestTable',
            data: { ColInt: 11, ColNvarchar: 'cc' },
            whereAnd: { Id: 1 },
        }]).exec(null);

        assert.deepEqual(1, affected);

        return Promise.resolve();
    });

    it('update batch', async () => {
        const affected = await dalHelper.dmls([{
            DMLType: dalHelper.DMLType.UPDATE,
            table: 'TestTable',
            data: { ColInt: 11, ColNvarchar: 'cc' },
            whereAnd: { Id: 1 },
        }, {
            DMLType: dalHelper.DMLType.UPDATE,
            table: 'TestTable',
            data: { ColInt: 12, ColNvarchar: 'dd' },
            whereAnd: { Id: [2, 3] },
        }]).exec();

        assert.deepEqual(3, affected);

        return Promise.resolve();
    });

    it('update or insert', async () => {
        const results = await dalHelper.dmls([{
            DMLType: dalHelper.DMLType.UPDATE_INSERT,
            table: 'TestTable',
            data: { ColInt: 11, ColNvarchar: 'ee' },
            whereAnd: { Id: 1 },
        }, {
            DMLType: dalHelper.DMLType.UPDATE_INSERT,
            table: 'TestTable',
            data: { ColInt: 13, ColNvarchar: 'ff' },
            whereAnd: { ColInt: 13 },
        }, {
            DMLType: dalHelper.DMLType.SELECT,
            table: 'TestTable',
            whereAnd: { Id: 1 },
        }, {
            DMLType: dalHelper.DMLType.SELECT,
            table: 'TestTable',
            whereAnd: { ColInt: 13 },
        }]).exec();

        assert.deepEqual('ee', results[0][0].ColNvarchar);
        assert.deepEqual('ff', results[1][0].ColNvarchar);

        return Promise.resolve();
    });

    it('where in varchar', async () => {
        const results = await dalHelper.select({
            table: 'TestTable',
            whereAnd: { ColNvarchar: ['dd', 'bb'] },
        }).exec();

        assert.deepEqual(3, results.length);

        return Promise.resolve();
    });

    it('where in int', async () => {
        const ids = [];
        for (let i = 1; i < 10000; i++) {
            ids.push(i);
        }
        const results = await dalHelper.select({
            table: 'TestTable',
            whereAnd: { Id: ids },
        }).exec();

        assert.deepEqual(6, results.length);

        return Promise.resolve();
    });


    it('count', async () => {
        const [result] = await dalHelper.count({
            table: 'TestTable',
            whereAnd: { Id: [1, 2] },
        }).exec();

        assert.equal(2, result.Count);

        return Promise.resolve();
    });

    it('delete', async () => {
        const affected = await dalHelper.delete({
            table: 'TestTable',
            whereAnd: { Id: 1 },
        }).exec();

        assert.equal(1, affected);

        return Promise.resolve();
    });


    it('proc sp_GetSequenceNo 100', async () => {
        for (let i = 1; i < 3; i++) {
            for (let j = 1; j < 100; j++) {
                const result = await dalHelper.proc('exec [sp_GetSequenceNo] @SequenceType, 1, 1, 99,@SequenceNo output', { SequenceType: 'T1' }, { SequenceNo: 0 });
                assert.deepEqual(j % 100, result.SequenceNo);
            }
        }

        return Promise.resolve();
    }).timeout(100000);

    it('proc sp_GetSequenceNo 10000', async () => {
        for (let j = 1; j < 2; j++) {
            for (let i = 1; i < 10000; i++) {
                const result = await dalHelper.proc('exec [sp_GetSequenceNo] @SequenceType, 1, 1, 9999,@SequenceNo output', { SequenceType: 'T2' }, { SequenceNo: 0 });
                assert.deepEqual(i % 10000, result.SequenceNo);
            }
        }
        return Promise.resolve();
    }).timeout(100000);
});


describe('mssql arr ddl', () => {
    before(async () => {
        const sqls = fs.readFileSync(`${__dirname}/prepare.sql`, 'utf-8');
        // console.log(sql);
        for (const sql of sqls.split('###')) {
            if (!sql) {
                continue;
            }
            const affected = await dalHelper.sql({ sql }).exec(null, false);
            if (affected === 0) {
                // console.error(affected, 'init error');
            }
        }
        return Promise.resolve();
    });

    let currentDateTime = new Date();
    let data = {
        ColInt: 1, ColNvarchar: 'aa', ColDateTime: currentDateTime, ColFloat: 1.123456,
    };
    it('insert', async () => {
        const affected = await dalHelper.insert({
            table: 'TestTable',
            data,
        }).exec();

        assert.equal(affected, 1);

        return Promise.resolve();
    });

    it('select', async () => {
        const [result] = await dalHelper.select({
            table: 'TestTable',
        }).exec();
        assert.deepEqual({ Id: 1, ...data, ...{ ColDateTime: parseInt(data.ColDateTime.getTime() / 1000) } }, { ...result, ...{ ColDateTime: parseInt(data.ColDateTime.getTime() / 1000) } });
        return Promise.resolve();
    });

    it('insert and return indentity', async () => {
        const [result] = await dalHelper.insert({
            table: 'TestTable',
            data,
            identity: true,
        }).exec();

        assert.deepEqual({ Id: 2 }, result);

        return Promise.resolve();
    });

    currentDateTime = new Date();
    data = {
        ColInt: 2, ColNvarchar: 'bb', ColDateTime: currentDateTime, ColFloat: 2.789123,
    };

    it('update', async () => {
        const affected = await dalHelper.update({
            table: 'TestTable',
            data,
            whereAnd: [['Id', 2]],
        }).exec();

        assert.equal(affected, 1);

        return Promise.resolve();
    });

    it('select lt', async () => {
        const [result] = await dalHelper.select({
            table: 'TestTable',
            whereAnd: [['Id', 2, '<']],
        }).exec();
        assert.deepEqual({ Id: 1, ...data, ...{ ColDateTime: parseInt(data.ColDateTime.getTime() / 1000) } }, { ...result, ...{ ColDateTime: parseInt(data.ColDateTime.getTime() / 1000) } });
        return Promise.resolve();
    });

    it('select lt lg', async () => {
        const [result] = await dalHelper.select({
            table: 'TestTable',
            whereAnd: [['Id', 3, '<'], ['Id', 1, '>']],
        }).exec();
        assert.deepEqual({ Id: 2, ...data, ...{ ColDateTime: parseInt(data.ColDateTime.getTime() / 1000) } }, { ...result, ...{ ColDateTime: parseInt(data.ColDateTime.getTime() / 1000) } });
        return Promise.resolve();
    });

    it('select again', async () => {
        const [result] = await dalHelper.select({
            table: 'TestTable',
            whereAnd: [['Id', 2]],
        }).exec();
        assert.deepEqual({ Id: 2, ...data, ...{ ColDateTime: parseInt(data.ColDateTime.getTime() / 1000) } }, { ...result, ...{ ColDateTime: parseInt(data.ColDateTime.getTime() / 1000) } });
        return Promise.resolve();
    });

    it('insert tran', async () => {
        const [result] = await dalHelper.dmls([{
            DMLType: dalHelper.DMLType.INSERT,
            table: 'TestTable',
            data,
        }, {
            DMLType: dalHelper.DMLType.INSERT,
            table: 'TestTable',
            data,
            identity: true,
        }, {
            DMLType: dalHelper.DMLType.INSERT,
            table: 'TestTable',
            data: { '@ColInt': '@TestTable_Id' },
        }]).exec();

        assert.deepEqual({ Id: 4 }, result);

        return Promise.resolve();
    });

    it('select count', async () => {
        const [result] = await dalHelper.count({
            table: 'TestTable',
        }).exec();
        assert.equal(5, result.Count);
        return Promise.resolve();
    });

    it('select tran', async () => {
        const [result] = await dalHelper.select({
            table: 'TestTable',
            whereAnd: [['Id', 5]],
        }).exec();
        assert.deepEqual(4, result.ColInt);
        return Promise.resolve();
    });

    it('update single', async () => {
        const affected = await dalHelper.dmls([{
            DMLType: dalHelper.DMLType.UPDATE,
            table: 'TestTable',
            data: { ColInt: 11, ColNvarchar: 'cc' },
            whereAnd: [['Id', 1]],
        }]).exec(null);

        assert.deepEqual(1, affected);

        return Promise.resolve();
    });

    it('update batch', async () => {
        const affected = await dalHelper.dmls([{
            DMLType: dalHelper.DMLType.UPDATE,
            table: 'TestTable',
            data: { ColInt: 11, ColNvarchar: 'cc' },
            whereAnd: [['Id', 1]],
        }, {
            DMLType: dalHelper.DMLType.UPDATE,
            table: 'TestTable',
            data: { ColInt: 12, ColNvarchar: 'dd' },
            whereAnd: [['Id', [2, 3]]],
        }]).exec();

        assert.deepEqual(3, affected);

        return Promise.resolve();
    });

    it('where in varchar', async () => {
        const results = await dalHelper.select({
            table: 'TestTable',
            whereAnd: [['ColNvarchar', ['dd', 'bb']]],
        }).exec();

        assert.deepEqual(3, results.length);

        return Promise.resolve();
    });

    it('where in int', async () => {
        const ids = [];
        // eslint-disable-next-line no-plusplus
        for (let i = 1; i < 10000; i++) {
            ids.push(i);
        }
        const results = await dalHelper.select({
            table: 'TestTable',
            whereAnd: [['Id', ids]],
        }).exec();

        assert.deepEqual(5, results.length);

        return Promise.resolve();
    });

    it('count', async () => {
        const [result] = await dalHelper.count({
            table: 'TestTable',
            whereAnd: [['Id', [1, 2]]],
        }).exec();

        assert.equal(2, result.Count);

        return Promise.resolve();
    });

    it('delete', async () => {
        const affected = await dalHelper.delete({
            table: 'TestTable',
            whereAnd: [['Id', 1]],
        }).exec();

        assert.equal(1, affected);

        return Promise.resolve();
    });

    it('proc sp_GetSequenceNo 100', async () => {
        for (let i = 1; i < 3; i++) {
            for (let j = 1; j < 100; j++) {
                const result = await dalHelper.proc('exec [sp_GetSequenceNo] @SequenceType, 1, 1, 99,@SequenceNo output', { SequenceType: 'T1' }, { SequenceNo: 0 });
                assert.deepEqual(j % 100, result.SequenceNo);
            }
        }

        return Promise.resolve();
    }).timeout(100000);

    it('proc sp_GetSequenceNo 10000', async () => {
        for (let j = 1; j < 2; j++) {
            for (let i = 1; i < 10000; i++) {
                const result = await dalHelper.proc('exec [sp_GetSequenceNo] @SequenceType, 1, 1, 9999,@SequenceNo output', { SequenceType: 'T2' }, { SequenceNo: 0 });
                assert.deepEqual(i % 10000, result.SequenceNo);
            }
        }
        return Promise.resolve();
    }).timeout(100000);
});
