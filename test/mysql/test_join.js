/* eslint-disable no-undef */
const assert = require('assert');
const config = require('./config');
const dalHelper = require('../../index.js')(config);

describe('mysql sql', () => {
    it('select ors', async () => {
        const options = await dalHelper.select({
            table: 'TestTable a',
            columns: ['a.*'],
            joins: [{
                table: 'TestTable b',
                on: 'a.Id=b.Id',
            }, {
                table: 'TestTable c',
                on: 'a.Id=c.Id',
            }],
            whereAnd: [['a.Id', 1], ['a.Id', 4]],
            // ors: [{ Id: 2 }, { Id: 3 }],
        }).options;

        // console.log(options);
        assert.equal(' select a.* from TestTable a join TestTable b on a.Id=b.Id  join TestTable c on a.Id=c.Id  where (a.Id = :wa_Id00_End and a.Id = :wa_Id01_End);', options[0].sql);

        return Promise.resolve();
    });
});

describe('mysql sql', () => {
    it('select ors', async () => {
        const options = await dalHelper.select({
            table: 'TestTable a',
            columns: ['a.*'],
            leftJoins: [{
                table: 'TestTable b',
                on: 'a.Id=b.Id',
            }, {
                table: 'TestTable c',
                on: 'a.Id=c.Id',
            }],
            whereAnd: [['a.Id', 1], ['a.Id', 4]],
            // ors: [{ Id: 2 }, { Id: 3 }],
        }).options;

        // console.log(options);
        assert.equal(' select a.* from TestTable a left join TestTable b on a.Id=b.Id  left join TestTable c on a.Id=c.Id  where (a.Id = :wa_Id00_End and a.Id = :wa_Id01_End);', options[0].sql);

        return Promise.resolve();
    });
});
