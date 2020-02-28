const config = require('./config');
const dalHelper = require('../../index.js')(config);

process.addListener('unhandledRejection', (err) => {
    console.log(1, err);
});
async function test() {
    await dalHelper.select({
        table: 'Test',
        whereAnd: { Id: [1, null] },
    }).exec();
}


test();
