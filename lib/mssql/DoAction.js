class DoAction {
    constructor(drive, sql, param) {
        this.drive = drive;
        this.sql = sql;
        this.param = param;
    }

    exec(callback, isDebug) {
        if (isDebug) {
            console.log(this.sql);
            console.log(this.param);
        }

        Error.captureStackTrace(this);
        return this.drive.exec(this.sql, this.param, callback).catch((err) => {
            if (err) {
                // eslint-disable-next-line no-param-reassign
                err.stack += `\n-----------------------\n${this.stack}`;
            }
            console.error(err);
            throw err;
        });
    }
}

module.exports = DoAction;
