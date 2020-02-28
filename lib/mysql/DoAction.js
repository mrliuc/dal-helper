class DoAction {
    constructor(drive, options) {
        this.drive = drive;
        this.options = options;
    }

    exec(callback, isDebug) {
        if (isDebug) {
            console.log(this.options);
        }

        Error.captureStackTrace(this);
        return this.drive.exec(this.options, callback).catch((err) => {
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
