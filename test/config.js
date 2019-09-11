module.exports = {
    user: 'test',
    password: '1234',
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