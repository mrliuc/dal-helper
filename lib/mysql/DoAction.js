class DoAction {
    constructor(drive,options) {
        this.drive = drive;
        this.options = options;
    }

    async exec(callback, isDebug) {
        if (isDebug) {
            console.log(this.options);
        }
        return this.drive.exec(this.options, callback);
    }
}

module.exports = DoAction;
