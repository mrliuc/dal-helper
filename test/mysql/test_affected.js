/* eslint-disable no-undef */
const fs = require('fs');
const assert = require('assert');
const config = require('./config');
const dalHelper = require('../../index.js')(config);

describe('mysql sql', () => {
    before(async () => {
        const sqls = fs.readFileSync(`${__dirname}/prepare.sql`, 'utf-8');
        // console.log(sqls.split(';').filter(sql=>sql).map(sql=>({sql})));
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

    const currentDateTime = new Date();
    const data = {
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

    it('update', async () => {
        const affected = await dalHelper.update({
            table: 'TestTable',
            data: { ColNvarchar: 'bb' },
            whereAnd: [['Id', 1]],
            affected: 2,
        }).exec();

        assert.equal(1, affected);

        return Promise.resolve();
    });
});
