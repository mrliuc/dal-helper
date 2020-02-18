module.exports = {
    user: 'sa',
    password: 'l111111.',
    server: '127.0.0.1',
    database: 'Test',
    port: 1433,
    // requestTimeout: 3000000,
    options: {
        useUTC: false,
        encrypt: true,
    },
    pool: {
        min: 0,
        max: 1,
        idleTimeoutMillis: 30000,
    },
};
