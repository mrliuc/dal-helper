module.exports = {
    user: 'sa',
    password: 'l111111.',
    server: '127.0.0.1',
    database: 'TransportPlatform',
    port: 1433,
    options: {
        useUTC: false,
        encrypt: true
    },
    pool: {
        min: 0,
        max: 10,
        idleTimeoutMillis: 3000
    }
};