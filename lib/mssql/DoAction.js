class DoAction {
    constructor(drive, sql, param) {
        this.drive = drive;
        this.sql = sql;
        this.param = param;
    }

    async exec(callback, isDebug) {
        if (isDebug) {
            console.log(this.sql);
            console.log(this.param);
        }
        return this.drive.exec(this.sql, this.param, callback);
    }
}

module.exports = DoAction;
