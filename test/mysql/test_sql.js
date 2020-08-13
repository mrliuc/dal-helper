/* eslint-disable no-undef */
const assert = require('assert');
const config = require('./config');
const dalHelper = require('../../index.js')(config);

describe('mysql sql', () => {
    it('select ors', async () => {
        const options = await dalHelper.select({
            table: 'TestTable',
            whereAnd: [['Id', 1], ['Id', 4]],
            ors: [{ Id: 2 }, { Id: 3 }],
        }).options;

        // console.log(options);
        assert.equal(' select TestTable.* from TestTable where (Id = :wa_Id00_End and Id = :wa_Id01_End) or ( Id=:wo_IdB0_00_End) or ( Id=:wo_IdB0_10_End);', options[0].sql);

        return Promise.resolve();
    });
});
